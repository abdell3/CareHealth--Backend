const nodemailer = require('nodemailer');
const emailConfig = require('../../config/email');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.port === 465,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
      }
    });
  }

  async sendEmail(to, subject, html) {
    try {
      if (!this.transporter) {
        this.initializeTransporter();
      }

      const mailOptions = {
        from: emailConfig.from,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset Request</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #7f8c8d;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this, please ignore this email.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ecf0f1;">
          <p style="color: #95a5a6; font-size: 12px;">This is an automated message. Please do not reply.</p>
        </div>
      </body>
      </html>
    `;
    return await this.sendEmail(email, 'Password Reset Request - CareHealth EHR', html);
  }

  async sendAccountSuspendedEmail(email, firstName) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Account Suspended</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e74c3c;">Account Suspended</h2>
          <p>Hello ${firstName || 'User'},</p>
          <p>Your account has been suspended. You will not be able to access the system until it is reactivated by an administrator.</p>
          <p>If you believe this is an error, please contact support.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ecf0f1;">
          <p style="color: #95a5a6; font-size: 12px;">This is an automated message. Please do not reply.</p>
        </div>
      </body>
      </html>
    `;
    return await this.sendEmail(email, 'Account Suspended - CareHealth EHR', html);
  }

  async sendAccountActivatedEmail(email, firstName) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Account Activated</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #27ae60;">Account Activated</h2>
          <p>Hello ${firstName || 'User'},</p>
          <p>Your account has been activated. You can now access the system.</p>
          <p>Welcome to CareHealth EHR!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ecf0f1;">
          <p style="color: #95a5a6; font-size: 12px;">This is an automated message. Please do not reply.</p>
        </div>
      </body>
      </html>
    `;
    return await this.sendEmail(email, 'Account Activated - CareHealth EHR', html);
  }

  async sendAppointmentConfirmationEmail(patientEmail, appointmentData) {
    const appointmentDate = new Date(appointmentData.startAt).toLocaleString();
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Appointment Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #27ae60;">Appointment Confirmed</h2>
          <p>Hello,</p>
          <p>Your appointment has been confirmed.</p>
          <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Date:</strong> ${appointmentDate}</p>
            ${appointmentData.location ? `<p><strong>Location:</strong> ${appointmentData.location}</p>` : ''}
            ${appointmentData.reason ? `<p><strong>Reason:</strong> ${appointmentData.reason}</p>` : ''}
          </div>
          <p>Please arrive on time for your appointment.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ecf0f1;">
          <p style="color: #95a5a6; font-size: 12px;">This is an automated message. Please do not reply.</p>
        </div>
      </body>
      </html>
    `;
    return await this.sendEmail(patientEmail, 'Appointment Confirmation - CareHealth EHR', html);
  }

  async sendAppointmentCancelledEmail(patientEmail, appointmentData) {
    const appointmentDate = new Date(appointmentData.startAt).toLocaleString();
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Appointment Cancelled</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e74c3c;">Appointment Cancelled</h2>
          <p>Hello,</p>
          <p>Your appointment has been cancelled.</p>
          <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Date:</strong> ${appointmentDate}</p>
            ${appointmentData.location ? `<p><strong>Location:</strong> ${appointmentData.location}</p>` : ''}
          </div>
          <p>If you need to reschedule, please contact us.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ecf0f1;">
          <p style="color: #95a5a6; font-size: 12px;">This is an automated message. Please do not reply.</p>
        </div>
      </body>
      </html>
    `;
    return await this.sendEmail(patientEmail, 'Appointment Cancelled - CareHealth EHR', html);
  }
}

module.exports = EmailService;

