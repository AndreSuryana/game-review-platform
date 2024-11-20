import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { ConfigService } from '@nestjs/config';
import { SessionController } from './session.controller';
import { RedisModule } from 'src/redis/redis.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [TokenModule, RedisModule],
  providers: [SessionService, ConfigService],
  exports: [SessionService],
  controllers: [SessionController],
})
export class SessionModule {}
