const bcrypt = require("bcryptjs");
const { sequelize, Sequelize, Visiteur } = require("../models");
const jwtService = require("../services/jwtService");

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

let passwordColumnChecked = false;
let passwordColumnExists = false;

const checkPasswordHashColumn = async () => {
  if (passwordColumnChecked) {
    return passwordColumnExists;
  }

  const [result] = await sequelize.query(
    `SELECT COUNT(*) as total
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'visiteur'
       AND COLUMN_NAME = 'mdpHash'`,
    { type: Sequelize.QueryTypes.SELECT },
  );

  passwordColumnExists = Number(result.total) > 0;
  passwordColumnChecked = true;
  return passwordColumnExists;
};

const ensurePasswordHashColumn = async () => {
  const exists = await checkPasswordHashColumn();
  if (exists) {
    return;
  }

  await sequelize.query(
    "ALTER TABLE visiteur ADD COLUMN mdpHash VARCHAR(255) NULL",
  );
  passwordColumnExists = true;
  passwordColumnChecked = true;
};

const generateVisitorId = async () => {
  while (true) {
    const candidate = `u${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;

    const [existing] = await sequelize.query(
      "SELECT id FROM visiteur WHERE id = ? LIMIT 1",
      {
        replacements: [candidate],
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    if (!existing) {
      return candidate;
    }
  }
};

const login = async (req, res) => {
  const login = (req.body?.login || req.query?.login || "").trim();
  const password = req.body?.password || req.query?.password;

  if (!login || !password) {
    return res.status(400).json({ error: "Login et password requis" });
  }

  try {
    const hasHashColumn = await checkPasswordHashColumn();
    const query = hasHashColumn
      ? "SELECT id, login, mdp, mdpHash FROM visiteur WHERE TRIM(login) = ? LIMIT 1"
      : "SELECT id, login, mdp FROM visiteur WHERE TRIM(login) = ? LIMIT 1";

    const [visitor] = await sequelize.query(query, {
      replacements: [login],
      type: Sequelize.QueryTypes.SELECT,
      raw: true,
    });

    if (!visitor) {
      return res.status(400).json({ error: "Identifiants invalides" });
    }

    let passwordIsValid = false;

    if (hasHashColumn && visitor.mdpHash) {
      passwordIsValid = await bcrypt.compare(password, visitor.mdpHash);
    } else {
      passwordIsValid = visitor.mdp?.trim() === password;
      if (passwordIsValid && hasHashColumn) {
        const mdpHash = await bcrypt.hash(password, 10);
        await sequelize.query("UPDATE visiteur SET mdpHash = ? WHERE id = ?", {
          replacements: [mdpHash, visitor.id],
          type: Sequelize.QueryTypes.UPDATE,
        });
      }
    }

    if (!passwordIsValid) {
      return res.status(400).json({ error: "Identifiants invalides" });
    }

    const token = jwtService.generateToken({
      id: visitor.id,
      login: visitor.login.trim(),
    });

    return res.json({ data: token });
  } catch (error) {
    console.error("Erreur connexion:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

const register = async (req, res) => {
  const login = (req.body?.login || "").trim();
  const password = req.body?.password || "";
  const nom = (req.body?.nom || "").trim();
  const prenom = (req.body?.prenom || "").trim();

  if (!login || !password || !nom || !prenom) {
    return res.status(400).json({
      error: "login, password, nom et prenom sont requis",
    });
  }

  if (!/^[a-zA-Z0-9._-]{4,20}$/.test(login)) {
    return res.status(400).json({
      error:
        "Le login doit contenir 4 a 20 caracteres (lettres, chiffres, ._-)",
    });
  }

  if (!PASSWORD_REGEX.test(password)) {
    return res.status(400).json({
      error:
        "Mot de passe trop faible: minimum 8 caracteres avec majuscule, minuscule, chiffre et caractere special",
    });
  }

  try {
    await ensurePasswordHashColumn();

    const [existingLogin] = await sequelize.query(
      "SELECT id FROM visiteur WHERE TRIM(login) = ? LIMIT 1",
      {
        replacements: [login],
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    if (existingLogin) {
      return res.status(409).json({ error: "Ce login existe deja" });
    }

    const visitorId = await generateVisitorId();
    const mdpHash = await bcrypt.hash(password, 10);
    const today = new Date().toISOString().slice(0, 10);
    const nowTs = Math.floor(Date.now() / 1000);

    await sequelize.query(
      `INSERT INTO visiteur
        (id, nom, prenom, login, mdp, mdpHash, adresse, cp, ville, dateEmbauche, timespan, ticket)
       VALUES
        (:id, :nom, :prenom, :login, :mdp, :mdpHash, :adresse, :cp, :ville, :dateEmbauche, :timespan, NULL)`,
      {
        replacements: {
          id: visitorId,
          nom,
          prenom,
          login,
          mdp: "HASHED",
          mdpHash,
          adresse: req.body?.adresse || "",
          cp: req.body?.cp || "",
          ville: req.body?.ville || "",
          dateEmbauche: req.body?.dateEmbauche || today,
          timespan: nowTs,
        },
        type: Sequelize.QueryTypes.INSERT,
      },
    );

    return res.status(201).json({
      data: {
        id: visitorId,
        login,
      },
      message: "Inscription reussie",
    });
  } catch (error) {
    console.error("Erreur inscription:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

const logout = async (req, res) => {
  const authorizationHeader = req.headers["authorization"];

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant ou incorrect" });
  }

  const token = authorizationHeader.replace("Bearer ", "");

  const tokenIsValid = jwtService.validateToken(token);
  const claims = jwtService.getClaims(token);
  const visiteurId = claims?.id;
  if (!tokenIsValid || !visiteurId) {
    return res
      .status(401)
      .json({ error: "Token manquant ou incorrect ou visiteur inexistant" });
  }

  const visitor = await Visiteur.findByPk(visiteurId);
  if (!visitor) {
    return res
      .status(401)
      .json({ error: "Token manquant ou incorrect ou visiteur inexistant" });
  }

  jwtService.addToBlacklist(token);
  return res.status(204).json({});
};

module.exports = { login, logout, register };
