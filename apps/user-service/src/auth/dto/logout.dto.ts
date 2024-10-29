import { IsString } from 'class-validator';

export class LogoutDto {
  @IsString()
  readonly sessionToken: string;
}
