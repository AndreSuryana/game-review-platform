import { IsNotEmpty, IsString } from 'class-validator';

export class RenewSessionDto {
  @IsString()
  @IsNotEmpty()
  readonly sessionToken: string;
}
