import { IsEmail } from 'class-validator';

export class SendResetPasswordDto {
  @IsEmail()
  readonly email: string;
}
