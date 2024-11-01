import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RevokeReason } from '../enums/revoke-reason.enum';

@Schema({ timestamps: true })
export class Session extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, unique: true, index: true })
  sessionToken: string;

  @Prop()
  lastActivity: Date;

  @Prop()
  expiresAt: Date;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  revokedAt: Date;

  @Prop({ enum: Object.values(RevokeReason) })
  revokedReason: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
