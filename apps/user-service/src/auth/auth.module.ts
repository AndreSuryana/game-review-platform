import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { SessionService } from 'src/session/session.service';
import { SessionModule } from 'src/session/session.module';
import { EmailModule } from 'src/email/email.module';
import { RedisModule } from 'src/redis/redis.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SessionModule,
    RedisModule,
    EmailModule,
    TokenModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, SessionService],
  exports: [AuthService],
})
export class AuthModule {}
