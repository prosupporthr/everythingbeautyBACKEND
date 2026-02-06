import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import EmailConfirmation from '../../templates/EmailConfirmation';

@Injectable()
export class EmailService implements OnModuleInit {
  private resend: Resend;
  private logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.resend = new Resend(this.configService.get('RESEND_KEY'));
    this.logger.debug('RESEND SETUP DONE');
  }

  async sendConfirmationMail({
    email,
    code,
    name,
  }: {
    email: string;
    code: string;
    name: string;
  }) {
    const { error, data } = await this.resend.emails.send({
      from: 'Everything Beautiful Support <support@chasescroll.com>',
      to: [email],
      subject: 'Verify Your email',
      react: EmailConfirmation({ code, firstName: name }),
    });
    if (error) {
      this.logger.error(error);
    }
    this.logger.log(data);
  }

  async sendGeneralMail({
    email,
    subject,
    body,
  }: {
    email: string;
    subject: string;
    body: string;
  }) {
    const { error, data } = await this.resend.emails.send({
      from: 'Everything Beautiful Support <support@chasescroll.com>',
      to: [email],
      subject,
      html: body,
    });
    if (error) {
      this.logger.error(error);
    }
    this.logger.log(data);
  }

  async sendCoachMail({
    email,
    subject,
    body,
  }: {
    email: string;
    subject: string;
    body: string;
  }) {
    const { error, data } = await this.resend.emails.send({
      from: 'Ryzly Support <support@2ddevstudios.com>',
      to: [email],
      subject,
      html: body,
    });
    if (error) {
      this.logger.error(error);
    }
    this.logger.log(data);
  }
}
