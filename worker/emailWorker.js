const nodemailer = require('nodemailer');

class EmailWorker {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail({ to, subject, text, html }) {
    try {
      if (!this.transporter) {
        this.initializeTransporter();
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
}

module.exports = EmailWorker;
