import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { SessionService } from 'src/session/session.service';
import { Session, SessionSchema } from 'src/session/schemas/session.schema';
import { PasswordResetJwtService } from './tokens/password-reset-jwt.service';
import { EmailVerificationJwtService } from './tokens/email-verification-jwt.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, SessionService, PasswordResetJwtService, EmailVerificationJwtService],
})
export class AuthModule { }
