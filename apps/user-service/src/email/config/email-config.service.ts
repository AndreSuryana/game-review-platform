import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { SmtpConfig } from 'src/config/smtp.config';

@Injectable()
export class EmailConfigService {
  constructor(private readonly configService: ConfigService) {}

  getTransporter() {
    const { host, port, user, pass } =
      this.configService.get<SmtpConfig>('smtp');

    return createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }
}
