const express = require('express');
const router = express.Router();
const { getMedicines } = require('../controllers/medicineController');

router.get('/', getMedicines);

module.exports = router;
