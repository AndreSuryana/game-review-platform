import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Address, AddressSchema } from './address.schema';
import { Preferences, PreferencesSchema } from './preferences.schema';
import { User } from 'src/user/schemas/user.schema';

@Schema({ timestamps: true })
export class Profile extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  avatarUrl: string;

  @Prop()
  bio: string;

  @Prop({ type: AddressSchema })
  address: Address;

  @Prop({ type: PreferencesSchema })
  preferences: Preferences;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
