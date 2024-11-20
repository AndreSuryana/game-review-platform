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
import { RevokeReason } from './enums/revoke-reason.enum';
import { RequestMetadata } from 'src/common/metadata/request.metadata';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  private readonly logger: Logger = new Logger(SessionController.name, {
    timestamp: true,
  });

  @GrpcMethod('UserService', 'RevokeSession')
  async revokeSession(
    request: RevokeSessionRequest,
  ): Promise<RevokeSessionResponse> {
    try {
      const { sessionToken, reason } = await validateConvertDto(
        RevokeSessionDto,
        request,
      );
      await this.sessionService.verifyToken(sessionToken);
      await this.sessionService.revoke(sessionToken, reason);
      return { message: 'Session successfully revoked' };
    } catch (e) {
      this.logger.error(`Error revoke session: ${e.message}`, e.stack);
      throw handleError(e);
    }
  }

  @GrpcMethod('UserService', 'RenewSession')
  async renewSession(
    request: RenewSessionRequest,
    metadata: RequestMetadata,
  ): Promise<RenewSessionResponse> {
    try {
      const { sessionToken } = await validateConvertDto(
        RenewSessionDto,
        request,
      );

      // We're renew token before the current token expired,
      // if token already expired then it should be respond with unauthorized.
      await this.sessionService.verifyToken(sessionToken);

      // Generate new token
      const { token, expiresAt } = await this.sessionService.renew(
        sessionToken,
        metadata.ipAddress,
        metadata.userAgent,
      );

      // Revoke the old token after successfully generating new token
      await this.sessionService.revoke(
        sessionToken,
        RevokeReason.NewTokenRequested,
      );

      return { newSessionToken: token, expiresAt };
    } catch (e) {
      this.logger.error(`Error renew session: ${e.message}`, e.stack);
      throw handleError(e);
    }
  }
}
