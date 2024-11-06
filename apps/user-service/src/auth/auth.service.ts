import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserCredentialsDto } from 'src/auth/dto/user-credentials.dto';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/schemas/user.schema';
import { UserRole } from 'src/user/enums/user-role.enum';
import { RegisterUserDto } from './dto/register-user.dto';
import { SessionService } from 'src/session/session.service';
import { LogoutDto } from './dto/logout.dto';
import { RequestMetadata } from 'src/common/metadata/request.metadata';
import { PasswordResetTokenUtil } from './tokens/password-reset-token.util';
import { ConfigService } from '@nestjs/config';
import { PasswordResetConfig } from 'src/config/password-reset.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly passwordResetTokenUtil: PasswordResetTokenUtil,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger: Logger = new Logger(AuthService.name, {
    timestamp: true,
  });

  async register(registerUserDto: RegisterUserDto): Promise<string> {
    const { username, email, password } = registerUserDto;

    // For user registration, ensure that both username and email are provided
    if (!username || !email) {
      throw new BadRequestException('Both username and email must be provided');
    }

    // Generate password salt and hash
    const passwordSalt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, passwordSalt);

    const newUser = await this.userService.insertUser({
      email: email,
      username: username,
      passwordSalt: passwordSalt,
      passwordHash: passwordHash,
      role: UserRole.Default,
    });
    this.logger.debug(`New user successfully added! ${newUser.id}`);

    // TODO: Sent email verification asyncronously after user successfully registered!

    return newUser.id;
  }

  async authenticate(
    userCredentialsDto: UserCredentialsDto,
    metadata: RequestMetadata,
  ): Promise<{ userId: string; sessionToken: string }> {
    const { username, email, password } = userCredentialsDto;

    // Find user by username or email
    let user: User;
    if (username) {
      user = await this.userService.findUserByUsername(username);
    } else if (email) {
      user = await this.userService.findUserByEmail(email);
    } else {
      throw new BadRequestException('Username or email must be provided');
    }

    // Check if user exists
    if (!user) {
      throw new NotFoundException('Could not find the user');
    }

    // Compare user password with the password in request
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Generate user session token
    const session = await this.sessionService.createSession(
      user.id,
      metadata.ipAddress,
      metadata.userAgent,
    );

    // Return the user session token
    return {
      userId: session.userId,
      sessionToken: session.sessionToken,
    };
  }

  async logout(logoutDto: LogoutDto): Promise<void> {
    const { sessionToken } = logoutDto;

    // Check if the session is active
    const session = await this.sessionService.findSession(sessionToken);
    if (!session || !session.isActive) {
      throw new UnauthorizedException('Session is inactive or does not exist');
    }

    // Validate the session token
    const isValidSession = this.sessionService.validateSession(sessionToken);
    if (!isValidSession) {
      throw new UnauthorizedException('Invalid session token');
    }

    // Invalidate session token
    await session.updateOne({ isActive: false });
    this.logger.log(`Session invalidated! Session ID=${session.id}`);
  }

  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userService.findUserById(userId);
    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    // Compare user password with the old password
    const passwordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid old password');
    }

    // Validate the old password is not same as the new password
    if (oldPassword === newPassword) {
      throw new BadRequestException(
        'New password should not be same as old password',
      );
    }

    // Generate password salt and hash
    const passwordSalt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(newPassword, passwordSalt);

    await user.updateOne({ passwordSalt, passwordHash });
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    // Find the user by the provided email
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('Could not find the user');
    }

    // Generate the password reset token
    const token = await this.passwordResetTokenUtil.generateToken(user.id);

    // 
    const passwordResetBaseUrl = this.configService.get<PasswordResetConfig>('passwordReset').url;
    const passwordResetUrl = this.generateUrlWithQuery(passwordResetBaseUrl, { token });
    
    // TODO: Sent the reset password email asyncronously with the frontend linked token is generated!
    this.logger.debug(`Password reset link: ${passwordResetUrl}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validate the password reset token
    const payload = await this.passwordResetTokenUtil.verifyToken(token);
    this.logger.debug(`Payload:`, payload);

    // Find the user by the ID stored in the payload
    const user = await this.userService.findUserById(payload.sub);
    if (!user) {
      throw new NotFoundException('Could not find the user');
    }

    // Update the user password
    await this.userService.updateUser(user.id, {
      password: newPassword
    });
  }

  async verifyEmail(token: string): Promise<void> {
    // TODO: Not yet implemented!
    throw new NotImplementedException();
  }

  private generateUrlWithQuery(baseUrl: string, queryParams: Record<string, string | number | boolean>): string {
    const url = new URL(baseUrl);

    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });

    return url.toString();
  }
}
