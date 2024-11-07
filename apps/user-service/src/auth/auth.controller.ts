import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  AuthenticateUserRequest,
  AuthenticateUserResponse,
  LogoutUserRequest,
  LogoutUserResponse,
  RegisterUserRequest,
  RegisterUserResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SendEmailVerificationRequest,
  SendEmailVerificationResponse,
  SendResetPasswordRequest,
  SendResetPasswordResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '@grp/proto/user/user-service';
import { validateConvertDto } from 'src/common/helpers/validation-pipe.helper';
import { handleError } from 'src/common/handlers/exception.handler';
import { AuthService } from './auth.service';
import { UserCredentialsDto } from './dto/user-credentials.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LogoutDto } from './dto/logout.dto';
import { Metadata } from '@grpc/grpc-js';
import { parseMetadata } from 'src/common/helpers/metadata.helper';
import { SendResetPasswordDto } from './dto/send-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SendEmailVerificationDto } from './dto/send-email-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private readonly logger: Logger = new Logger(AuthController.name, {
    timestamp: true,
  });

  @GrpcMethod('UserService', 'RegisterUser')
  async registerUser(
    request: RegisterUserRequest,
  ): Promise<RegisterUserResponse> {
    try {
      const registerUserCredentials = await validateConvertDto(
        RegisterUserDto,
        request,
      );

      const userId = await this.authService.register(registerUserCredentials);
      this.logger.log(`New user registered successfully: ${userId}`);

      return {
        userId: userId,
        message: 'User registered successfully',
      };
    } catch (e) {
      this.logger.error(`Error registering user: ${e.message}`, e.stack);
      throw handleError(e);
    }
  }

  @GrpcMethod('UserService', 'AuthenticateUser')
  async authenticateUser(
    request: AuthenticateUserRequest,
    metadata: Metadata,
  ): Promise<AuthenticateUserResponse> {
    try {
      const userCredentials = await validateConvertDto(
        UserCredentialsDto,
        request,
      );

      const session = await this.authService.authenticate(
        userCredentials,
        parseMetadata(metadata),
      );
      this.logger.log(`User ${session.userId} authenticated`);

      return { sessionToken: session.sessionToken };
    } catch (e) {
      this.logger.error(`Error authenticating user: ${e.message}`, e.stack);
      throw handleError(e);
    }
  }

  @GrpcMethod('UserService', 'LogoutUser')
  async logoutUser(request: LogoutUserRequest): Promise<LogoutUserResponse> {
    try {
      const logoutDto = await validateConvertDto(LogoutDto, request);

      await this.authService.logout(logoutDto);

      return { message: 'Successfully logout user' };
    } catch (e) {
      this.logger.error(`Error logout user: ${e.message}`, e.stack);
      throw handleError(e);
    }
  }

  @GrpcMethod('UserService', 'SendResetPassword')
  async sendResetPassword(
    request: SendResetPasswordRequest,
  ): Promise<SendResetPasswordResponse> {
    try {
      const { email } = await validateConvertDto(SendResetPasswordDto, request);
      await this.authService.sendPasswordResetEmail(email);
      return { message: 'Password reset email sent successfully' };
    } catch (e) {
      this.logger.error(`Error send reset password: ${e.message}`, e.stack);
      throw handleError(e);
    }
  }

  @GrpcMethod('UserService', 'ResetPassword')
  async resetPassword(
    request: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> {
    try {
      const { resetToken, newPassword } = await validateConvertDto(
        ResetPasswordDto,
        request,
      );
      await this.authService.resetPassword(resetToken, newPassword);
      return { message: 'Password has been reset successfully' };
    } catch (e) {
      this.logger.error(`Error reset password: ${e.message}`, e.stack);
      throw handleError(e);
    }
  }

  @GrpcMethod('UserService', 'UpdatePassword')
  async updatePassword(
    request: UpdatePasswordRequest,
  ): Promise<UpdatePasswordResponse> {
    try {
      const { userId, oldPassword, newPassword } = await validateConvertDto(
        UpdatePasswordDto,
        request,
      );
      await this.authService.updatePassword(userId, oldPassword, newPassword);
      return { message: 'Password updated successfully' };
    } catch (e) {
      this.logger.error(`Error update password: ${e.message}`, e.stack);
      throw handleError(e);
    }
  }

  @GrpcMethod('UserService', 'SendEmailVerification')
  async sendEmailVerification(
    request: SendEmailVerificationRequest,
  ): Promise<SendEmailVerificationResponse> {
    try {
      const { email } = await validateConvertDto(
        SendEmailVerificationDto,
        request,
      );
      await this.authService.sendEmailVerification(email);
      return {
        message:
          'Verification email sent successfully. Please check your inbox to verify your email address.',
      };
    } catch (e) {
      this.logger.error(`Error send email verification: ${e.message}`, e.stack);
      throw handleError(e);
    }
  }

  @GrpcMethod('UserService', 'VerifyEmail')
  async verifyEmail(request: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    try {
      const { verificationToken } = await validateConvertDto(
        VerifyEmailDto,
        request,
      );
      await this.authService.verifyEmail(verificationToken);
      return {
        message: 'Email verified successfully. Your account is now activated.',
      };
    } catch (e) {
      this.logger.error(`Error verifying email: ${e.message}`, e.stack);
      throw handleError(e);
    }
  }
}
