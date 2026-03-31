const express = require("express");
const router = express.Router();
const { login, logout, register } = require("../controllers/authController");

router.post("/connexion", login);
router.post("/inscription", register);
router.get("/deconnexion", logout);

module.exports = router;
