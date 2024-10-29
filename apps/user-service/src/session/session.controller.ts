import {
  RenewSessionRequest,
  RenewSessionResponse,
  RevokeSessionRequest,
  RevokeSessionResponse,
} from '@grp/proto/user/user-service';
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RevokeSessionDto } from 'src/session/dto/revoke-session.dto';
import { handleError } from 'src/common/handlers/exception.handler';
import { validateConvertDto } from 'src/common/helpers/validation-pipe.helper';
import { SessionService } from './session.service';
import { RenewSessionDto } from './dto/renew-session.dto';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  private readonly logger: Logger = new Logger(SessionController.name, {
    timestamp: true,
  });

  @GrpcMethod('UserService', 'RenewSession')
  async renewSession(
    request: RenewSessionRequest,
  ): Promise<RenewSessionResponse> {
    try {
      const renewSessionDto = await validateConvertDto(
        RenewSessionDto,
        request,
      );
      const session = await this.sessionService.renewSession(renewSessionDto);
      return {
        newSessionToken: session.sessionToken,
        expiresAt: session.expiresAt.toISOString(),
      };
    } catch (e) {
      this.logger.error(`Error renew session: ${e.message}`, e.stack);
      throw handleError(e);
    }
  }

  @GrpcMethod('UserService', 'RevokeSession')
  async revokeSession(
    request: RevokeSessionRequest,
  ): Promise<RevokeSessionResponse> {
    try {
      const revokeSessionDto = await validateConvertDto(
        RevokeSessionDto,
        request,
      );
      await this.sessionService.revoke(revokeSessionDto);
      return { message: 'Session successfully revoked' };
    } catch (e) {
      this.logger.error(`Error revoke session: ${e.message}`, e.stack);
      throw handleError(e);
    }
  }
}
