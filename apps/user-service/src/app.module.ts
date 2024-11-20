import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import configuration from 'src/config/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfig } from 'src/config/database.config';
import { UserModule } from './user/user.module';
import { SessionModule } from './session/session.module';
import { EmailModule } from './email/email.module';
import { BullModule } from '@nestjs/bullmq';
import { REDIS_CLIENT } from './redis/constants/redis.constant';
import { RedisModule } from './redis/redis.module';
import { TokenModule } from './token/token.module';
import Redis from 'ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const { host, port, name, user, password } =
          configService.get<DatabaseConfig>('database');

        let uri = `mongodb://${host}:${port}/${name}`;
        if (user && password) {
          uri = `mongodb://${user}:${password}@${host}:${port}/${name}`;
        }

        return { uri };
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [RedisModule],
      useFactory: (redisClient: Redis) => ({
        connection: redisClient,
      }),
      inject: [REDIS_CLIENT],
    }),
    AuthModule,
    UserModule,
    SessionModule,
    EmailModule,
    RedisModule,
    TokenModule,
  ],
})
export class AppModule {}
