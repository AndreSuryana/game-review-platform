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
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRole } from 'src/user/enums/user-role.enum';
import { RegisterUserDto } from './dto/register-user.dto';
import { SessionService } from 'src/session/session.service';
import { LogoutDto } from './dto/logout.dto';
import { RequestMetadata } from 'src/common/metadata/request.metadata';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
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
    metadata: RequestMetadata
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

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    // TODO: Not yet implemented!
    throw new NotImplementedException();
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    // TODO: Not yet implemented!
    throw new NotImplementedException();
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // TODO: Not yet implemented!
    throw new NotImplementedException();
  }

  async verifyEmail(token: string): Promise<void> {
    // TODO: Not yet implemented!
    throw new NotImplementedException();
  }
}
