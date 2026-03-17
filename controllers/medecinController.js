const { sequelize } = require('../models');
const { Op } = require('sequelize');
const Medecin = require('../models/medecin')(sequelize);

const getDoctors = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const element = parseInt(req.query.element) || 10;
    const name = req.query.name || '';
    const lastnameOrder = req.query.lastname || 'ASC';
    const firstnameOrder = req.query.firstname || 'ASC';

    const offset = (page - 1) * element;
    const limit = element;
    const order = [['nom', lastnameOrder], ['prenom', firstnameOrder]];

    const where = name ? {
        [Op.or]: [
            { nom: { [Op.like]: `%${name}%` } },
            { prenom: { [Op.like]: `%${name}%` } }
        ]
    } : {};

    try {
        const { count, rows: doctors } = await Medecin.findAndCountAll({
            where,
            order,
            limit,
            offset,
            attributes: ['id', 'nom', 'prenom', 'tel', 'adresse', 'specialitecomplementaire']
        });

        const response = {
            doctors: doctors.map(doctor => ({
                id: doctor.id,
                lastname: doctor.nom,
                firstname: doctor.prenom,
                phone: doctor.tel || '',
                address: doctor.adresse || '',
                speciality: doctor.specialitecomplementaire || ''
            })),
            currentPage: page,
            totalPages: Math.ceil(count / element)
        };

        res.json(response);
    } catch (error) {
        console.error('Erreur getDoctors:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};


const getDoctorById = async (req, res) => {
    const { id } = req.params;

    const rapports = await sequelize.query(`
    SELECT r.id, r.date, r.motif, r.bilan, r.idVisiteur
    FROM rapport r
    WHERE r.idMedecin = ?
    ORDER BY r.date DESC
  `, {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
    });

    const doctor = await Medecin.findByPk(id);
    if (!doctor) {
        return res.status(404).json({ error: 'Médecin non trouvé' });
    }

    const reportList = rapports.map(r => ({
        id: r.id,
        date: r.date,
        motiv: r.motif,
        'balance sheet': r.bilan,
        idVisiteur: r.idVisiteur
    }));

    const response = {
        id: doctor.id,
        lastname: doctor.nom,
        firstname: doctor.prenom,
        phone: doctor.tel || '',
        address: doctor.adresse || '',
        speciality: doctor.specialitecomplementaire || '',
        department: doctor.departement || '',
        reports: reportList
    };

    res.json(response);
};

module.exports = { getDoctors, getDoctorById };
