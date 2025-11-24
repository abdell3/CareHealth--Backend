const jwt = require('jsonwebtoken');
const authConfig = require('../../../config/auth');

class AuthMiddleware {
  verifyAuth(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Authorization token is required'
        });
      }

      const token = authHeader.substring(7);
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Authorization token is required'
        });
      }

      const decoded = jwt.verify(token, authConfig.accessTokenSecret);
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  }

  requireRole(...allowedRoles) {
    return (req, res, next) => {
      if (!req.user || !req.user.role) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Role required'
        });
      }

      const userRoleId = req.user.role.toString();
      const allowedRoleIds = allowedRoles.map(role => role.toString());

      if (!allowedRoleIds.includes(userRoleId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions'
        });
      }

      next();
    };
  }

  requireAdmin() {
    return async (req, res, next) => {
      try {
        if (!req.user || !req.user.role) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Authentication required'
          });
        }

        const Role = require('../Models/Role');
        const adminRole = await Role.findOne({ name: 'admin' });

        if (!adminRole) {
          return res.status(500).json({
            success: false,
            message: 'Admin role not found in database'
          });
        }

        const userRoleId = req.user.role.toString();
        const adminRoleId = adminRole._id.toString();

        if (userRoleId !== adminRoleId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Admin privileges required'
          });
        }

        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    };
  }
}

module.exports = new AuthMiddleware();
