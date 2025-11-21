const express = require('express');
const router = express.Router();
const AuthController = require('../app/Http/Controllers/AuthController');
const AuthMiddleware = require('../app/Http/Middlewares/AuthMiddleware');

const controller = new AuthController();

router.post('/register', controller.register.bind(controller));
router.post('/login', controller.login.bind(controller));
router.post('/refresh', controller.refresh.bind(controller));
router.post('/logout', AuthMiddleware.verifyAuth, controller.logout.bind(controller));
router.post('/change-password', AuthMiddleware.verifyAuth, controller.changePassword.bind(controller));
router.post('/request-reset', controller.requestPasswordReset.bind(controller));
router.post('/reset', controller.resetPassword.bind(controller));

module.exports = router;
