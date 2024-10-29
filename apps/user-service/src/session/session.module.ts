import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './schemas/session.schema';
import { SessionService } from './session.service';
import { ConfigService } from '@nestjs/config';
import { SessionController } from './session.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
  ],
  providers: [SessionService, ConfigService],
  exports: [SessionService],
  controllers: [SessionController],
})
export class SessionModule {}
