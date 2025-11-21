module.exports = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key-change-in-production',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  resetTokenExpiryMinutes: 30
};
