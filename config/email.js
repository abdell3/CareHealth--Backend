module.exports = {
  host: process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587'),
  user: process.env.EMAIL_USER || process.env.SMTP_USER,
  pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
  from: process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.EMAIL_USER || 'noreply@carehealth.com'
};

