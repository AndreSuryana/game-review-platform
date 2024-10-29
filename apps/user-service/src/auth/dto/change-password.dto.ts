import { IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @IsStrongPassword()
  readonly oldPassword: string;

  @IsStrongPassword()
  readonly newPassword: string;
}
