const jwtService = require('../services/jwtService');
const { sequelize } = require('../models');
const { Op } = require('sequelize');
const Rapport = require('../models/rapport')(sequelize);
const Offrir = require('../models/offrir')(sequelize);
const Visiteur = require('../models/visiteur')(sequelize);
const Medecin = require('../models/medecin')(sequelize);
const Medicament = require('../models/medicament')(sequelize);

const getReports = async (req, res) => {
    const page = req.query.page || 1;
    const element = req.query.element || 10;
    const offset = (parseInt(page) - 1) * parseInt(element);

    try {
        const { count, rows } = await Rapport.findAndCountAll({
            order: [['date', 'DESC']],
            limit: parseInt(element),
            offset
        });

        const response = rows.map(report => ({
            id: report.id,
            date: report.date,  // Y-m-d auto
            motive: report.motif,
            'balance sheet': report.bilan
        }));

        response.currentPage = page;
        response.totalPages = Math.ceil(count / element);

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error });
    }
};
const getReportById = async (req, res) => {
    const { id } = req.params;

    try {
        // Rapport + visiteur + médecin en 1 query
        const [report] = await sequelize.query(`
      SELECT r.id, r.date, r.motif, r.bilan, 
             v.id as v_id, v.nom as v_nom, v.prenom as v_prenom,
             m.id as m_id, m.nom as m_nom, m.prenom as m_prenom
      FROM rapport r
      LEFT JOIN visiteur v ON r.idVisiteur = v.id
      LEFT JOIN medecin m ON r.idMedecin = m.id
      WHERE r.id = ?
    `, {
            replacements: [id],
            type: sequelize.QueryTypes.SELECT
        });

        if (!report) {
            return res.status(404).json({ error: 'Rapport non trouvé' });
        }

        const response = {
            id: report.id,
            date: report.date,
            motive: report.motif,
            'balance sheet': report.bilan,
            visitor: {
                id: report.v_id,
                lastname: report.v_nom,
                firstname: report.v_prenom
            },
            doctor: {
                id: report.m_id || '',
                lastname: report.m_nom || '',
                firstname: report.m_prenom || ''
            }
        };

        res.json(response);
    } catch (error) {
        console.error('getReportById error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const createReport = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token manquant ou incorrect' });
    }

    const token = authHeader.replace('Bearer ', '');
    const tokenIsValid = jwtService.validateToken(token);
    const tokenIsBlacklisted = jwtService.isBlacklisted(token);
    const claims = jwtService.getClaims(token);
    const visiteurId = claims?.id;

    const visiteur = await Visiteur.findByPk(visiteurId);
    if (!visiteur || !tokenIsValid || tokenIsBlacklisted) {
        return res.status(401).json({ error: 'Token manquant ou incorrect ou visiteur inexistant' });
    }

    const { balanceSheet, motive, doctorId, date, medicineId, quantity } = req.body;

    try {
        const medicament = await Medicament.findByPk(medicineId);
        if (!medicament) {
            return res.status(400).json({ data: "Ce médicament n'existe pas" });
        }

        const medecin = doctorId ? await Medecin.findByPk(doctorId) : null;

        // INSERT rapport
        const [reportId] = await sequelize.query(
            'INSERT INTO rapport (date, motif, bilan, idVisiteur, idMedecin) VALUES (:date, :motif, :bilan, :idVisiteur, :idMedecin)',
            {
                replacements: {
                    date: date,
                    motif: motive,
                    bilan: balanceSheet,
                    idVisiteur: visiteurId,
                    idMedecin: medecin?.id || null
                },
                type: sequelize.QueryTypes.INSERT
            }
        );

        // INSERT offrir
        await sequelize.query(
            'INSERT INTO offrir (idRapport, idMedicament, quantite) VALUES (:idRapport, :idMedicament, :quantite) ON DUPLICATE KEY UPDATE quantite = VALUES(quantite)',
            {
                replacements: {
                    idRapport: reportId,
                    idMedicament: medicineId,
                    quantite: quantity
                },
                type: sequelize.QueryTypes.INSERT
            }
        );

        res.status(201).json({ data: 'Le rapport a été créé' });
    } catch (error) {
        console.error('createReport:', error.message);
        res.status(500).json({ error: 'Erreur création' });
    }
};

module.exports = { getReports, getReportById, createReport };
