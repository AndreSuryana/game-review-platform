import { IsNotEmpty, IsString } from 'class-validator';
import { Address } from '../schemas/address.schema';
import { Preferences } from '../schemas/preferences.schema';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  firstName?: string | undefined;

  lastName?: string | undefined;

  bio?: string | undefined;

  address?: Address | undefined;

  preferences?: Preferences | undefined;
}
