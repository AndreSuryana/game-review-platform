import { IsString, IsStrongPassword } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  readonly userId: string;

  @IsStrongPassword()
  readonly oldPassword: string;

  @IsStrongPassword()
  readonly newPassword: string;
}
