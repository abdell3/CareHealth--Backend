const express = require('express');
const router = express.Router();

// Route registration
router.use('/v1/auth', require('./auth.routes'));
router.use('/v1/users', require('./users.routes'));
router.use('/v1/patients', require('./patients.routes'));
// router.use('/v1/appointments', require('./appointments.routes'));
// router.use('/v1/consultations', require('./consultations.routes'));
// router.use('/v1/prescriptions', require('./prescriptions.routes'));
// router.use('/v1/pharmacy', require('./pharmacy.routes'));
// router.use('/v1/laboratory', require('./laboratory.routes'));
// router.use('/v1/documents', require('./documents.routes'));

module.exports = router;

