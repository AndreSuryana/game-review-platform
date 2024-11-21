import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SessionService } from 'src/session/session.service';
import { SessionModule } from 'src/session/session.module';
import { EmailModule } from 'src/email/email.module';
import { RedisModule } from 'src/redis/redis.module';
import { TokenModule } from 'src/token/token.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    SessionModule,
    RedisModule,
    EmailModule,
    TokenModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionService],
  exports: [AuthService],
})
export class AuthModule {}
