import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { SessionService } from 'src/session/session.service';
import { Session, SessionSchema } from 'src/session/schemas/session.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PasswordResetConfig } from 'src/config/password-reset.config';
import { PasswordResetTokenUtil } from './tokens/password-reset-token.util';
import { EmailVerificationTokenUtil } from './tokens/email-verification-token.util';
import { EmailVerificationConfig } from 'src/config/email-verification.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),

    // JWT Module for Password Reset
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const { secret, expiresIn } = configService.get<PasswordResetConfig>('passwordReset');
        return {
          secret,
          signOptions: { expiresIn },
        }
      },
      inject: [ConfigService],
    }),

    // JWT Module for Email Verification
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const { secret, expiresIn } = configService.get<EmailVerificationConfig>('emailVerification');
        return {
          secret,
          signOptions: { expiresIn },
        }
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, SessionService, PasswordResetTokenUtil, EmailVerificationTokenUtil],
})
export class AuthModule { }
