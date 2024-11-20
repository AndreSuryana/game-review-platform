import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // Register JwtModule so it available to the TokenService,
    // the JWT configuration will be replaced in the implementation
    JwtModule.register({
      secret: '',
      signOptions: { expiresIn: '1m' },
    }),
    ConfigModule,
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
