const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const pdfRoutes = require('./pdfRoutes');

router.use('/auth', authRoutes);
router.use('/pdf', pdfRoutes);

module.exports = router;
