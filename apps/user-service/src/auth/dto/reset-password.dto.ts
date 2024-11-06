import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  readonly resetToken: string;

  @IsStrongPassword()
  readonly newPassword: string;
}
