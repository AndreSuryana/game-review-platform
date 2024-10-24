import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  passwordSalt: string;

  @Prop({ required: true, default: 'user' }) // TODO: Make a type for this role! Don't use hardcoded value!
  role: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ default: 0 })
  failedLoginAttempts: number;

  @Prop()
  lastFailedLogin: Date;

  @Prop()
  lastLogin: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
