import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  AuthenticateUserRequest,
  AuthenticateUserResponse,
  LogoutUserRequest,
  LogoutUserResponse,
  RegisterUserRequest,
  RegisterUserResponse,
} from '@grp/proto/user/user-service';
import { validateConvertDto } from 'src/common/helpers/validation-pipe.helper';
import { handleError } from 'src/common/handlers/exception.handler';
import { AuthService } from './auth.service';
import { UserCredentialsDto } from './dto/user-credentials.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LogoutDto } from './dto/logout.dto';

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
  ): Promise<AuthenticateUserResponse> {
    try {
      const userCredentials = await validateConvertDto(
        UserCredentialsDto,
        request,
      );

      const session = await this.authService.authenticate(userCredentials);
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
}
