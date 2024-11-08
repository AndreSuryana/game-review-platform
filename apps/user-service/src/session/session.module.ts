import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { ConfigService } from '@nestjs/config';
import { SessionController } from './session.controller';
import { JwtModule } from '@nestjs/jwt';
import { SessionConfig } from 'src/config/session.config';
import { RedisProvider } from 'src/redis/providers/redis.provider';

@Module({
  imports: [
    // JWT for Session Token
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const { secret, expiresIn } =
          configService.get<SessionConfig>('session');
        return {
          secret,
          signOptions: { expiresIn },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [SessionService, ConfigService, RedisProvider],
  exports: [SessionService, JwtModule, RedisProvider],
  controllers: [SessionController],
})
export class SessionModule {}
