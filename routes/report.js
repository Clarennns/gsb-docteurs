const express = require('express');
const router = express.Router();
const { getReports, getReportById, createReport } = require('../controllers/reportController');

router.get('/', getReports);
router.get('/:id', getReportById);
router.post('/', createReport);

module.exports = router;
