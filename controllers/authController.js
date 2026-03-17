const { sequelize } = require('../models');
const Visiteur = require('../models/visiteur')(sequelize);
const jwtService = require('../services/jwtService');

const login = async (req, res) => {
    const { login, password } = req.body;

    const visiteur = await Visiteur.findOne({
        where: { login, mdp: password }
    });

    if (!visiteur) {
        return res.status(400).json({ error: 'Login ou mot de passe incorrect' });
    }

    const token = jwtService.generateToken({
        id: visiteur.id,
        login: visiteur.login
    });

    res.json({ data: token });
};

const logout = async (req, res) => {
    const authorizationHeader = req.headers['authorization'];

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token manquant ou incorrect' });
    }

    const token = authorizationHeader.replace('Bearer ', '');

    const tokenIsValid = jwtService.validateToken(token);
    const claims = jwtService.getClaims(token);
    const visiteurId = claims?.id;
    if (!tokenIsValid || !visiteurId) {
        return res.status(401).json({ error: 'Token manquant ou incorrect ou visiteur inexistant' });
    }

    const visitor = await Visiteur.findByPk(visiteurId);
    if (!visitor) {
        return res.status(401).json({ error: 'Token manquant ou incorrect ou visiteur inexistant' });
    }

    jwtService.addToBlacklist(token);
    return res.status(204).json({});
};

module.exports = { login, logout };
