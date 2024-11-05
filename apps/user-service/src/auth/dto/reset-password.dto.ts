import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  readonly token: string;

  @IsStrongPassword()
  readonly newPassword: string;
}
