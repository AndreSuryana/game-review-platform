import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { SessionService } from 'src/session/session.service';
import { PasswordResetJwtService } from './tokens/password-reset-jwt.service';
import { EmailVerificationJwtService } from './tokens/email-verification-jwt.service';
import { SessionModule } from 'src/session/session.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SessionModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    SessionService,
    PasswordResetJwtService,
    EmailVerificationJwtService,
  ],
})
export class AuthModule {}
