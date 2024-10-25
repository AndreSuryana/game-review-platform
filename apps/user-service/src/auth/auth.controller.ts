import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
    RegisterUserRequest,
    RegisterUserResponse,
} from '@grp/proto/user/user-service';
import { validateConvertDto } from 'src/common/helpers/validation-pipe.helper';
import { handleError } from 'src/common/handlers/exception.handler';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
    private readonly logger: Logger;

    constructor(private readonly userService: UserService) {
        this.logger = new Logger(AuthController.name, {
            timestamp: true,
        });
    }

    @GrpcMethod('UserService', 'RegisterUser')
    async registerUser(
        request: RegisterUserRequest,
    ): Promise<RegisterUserResponse> {
        try {
            const createUserDto = await validateConvertDto(CreateUserDto, request);

            const user = await this.userService.createUser(createUserDto);
            this.logger.log(`New user registered successfully: ${user.id}`);

            return {
                userId: user.id,
                message: 'User registered successfully',
            };
        } catch (e) {
            this.logger.error(`Error registering user: ${e.message}`, e.stack);
            throw handleError(e);
        }
    }
}
