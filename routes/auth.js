const express = require('express');
const router = express.Router();
const { login, logout } = require('../controllers/authController');

router.post('/connexion', login);
router.get('/deconnexion', logout);

module.exports = router;
