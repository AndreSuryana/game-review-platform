import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
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
import { PasswordResetJwtService } from './tokens/password-reset-jwt.service';
import { EmailVerificationJwtService } from './tokens/email-verification-jwt.service';
import { RevokeReason } from 'src/session/enums/revoke-reason.enum';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly passwordResetJwt: PasswordResetJwtService,
    private readonly emailVerificationJwt: EmailVerificationJwtService,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
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

    this.emailService.sendVerificationEmail(newUser.id, newUser.email);

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
    const token = await this.sessionService.generateToken(
      user.id,
      metadata.ipAddress,
      metadata.userAgent,
    );

    // Return the user session token
    return {
      userId: user.id,
      sessionToken: token,
    };
  }

  async logout(logoutDto: LogoutDto): Promise<void> {
    const { sessionToken } = logoutDto;

    // Validate the session token
    const payload = await this.sessionService.verifyToken(sessionToken);

    // Invalidate session token
    await this.sessionService.revoke(sessionToken, RevokeReason.UserLogout);
    this.logger.debug('Session invalidated', payload);
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

    this.emailService.sendPasswordResetEmail(user.id, user.email);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validate the password reset token
    const payload = await this.passwordResetJwt.verifyToken(token);
    this.logger.debug(`Payload:`, payload);

    // Find the user by the ID stored in the payload
    const user = await this.userService.findUserById(payload.sub);
    if (!user) {
      throw new NotFoundException('Could not find the user');
    }

    // Update the user password
    await this.userService.updateUser(user.id, {
      password: newPassword,
    });
  }

  async sendEmailVerification(email: string): Promise<void> {
    // Find the user ID if not provided
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('Could not find the user');
    }

    // Check whether user is already verified
    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    this.emailService.sendVerificationEmail(user.id, user.email);
  }

  async verifyEmail(token: string): Promise<void> {
    // Validate the email verification token
    const payload = await this.emailVerificationJwt.verifyToken(token);
    this.logger.debug(`Payload:`, payload);

    // Find the user by the ID stored in the payload
    const user = await this.userService.findUserByEmail(payload.email);
    if (!user) {
      throw new NotFoundException('Could not find the user');
    }

    // Check whether user is already verified
    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Update the user verification status
    await this.userService.updateUser(user.id, {
      emailVerified: true,
    });
  }

  async generateEmailVerificationToken(
    userId: string,
    email: string,
  ): Promise<string> {
    return await this.emailVerificationJwt.generateToken(userId, email);
  }

  async generatePasswordResetToken(userId: string): Promise<string> {
    return await this.passwordResetJwt.generateToken(userId);
  }
}
