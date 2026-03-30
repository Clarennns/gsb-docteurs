const { sequelize, Sequelize, Medecin } = require("../models");
const { Op } = require("sequelize");

const getDoctors = async (req, res) => {
  const page = parseInt(req.query.page || "1", 10);
  const element = parseInt(req.query.element || "100", 10);
  const name = (req.query.name || "").trim();
  const lastnameOrder = req.query.lastname || "ASC";
  const firstnameOrder = req.query.firstname || "ASC";

  const offset = (page - 1) * element;
  const limit = element;
  const order = [
    ["nom", lastnameOrder],
    ["prenom", firstnameOrder],
  ];

  const where = name
    ? {
        [Op.or]: [
          { nom: { [Op.like]: `%${name}%` } },
          { prenom: { [Op.like]: `%${name}%` } },
        ],
      }
    : {};

  try {
    const { count, rows: doctors } = await Medecin.findAndCountAll({
      where,
      order,
      limit,
      offset,
      attributes: [
        "id",
        "nom",
        "prenom",
        "tel",
        "adresse",
        "specialitecomplementaire",
      ],
    });

    res.json({
      medecins: doctors.map((doctor) => ({
        id: doctor.id,
        nom: doctor.nom,
        prenom: doctor.prenom,
        tel: doctor.tel || "",
        adresse: doctor.adresse || "",
        specialitecomplementaire: doctor.specialitecomplementaire || "",
      })),
      currentPage: page,
      totalPages: Math.ceil(count / element),
    });
  } catch (error) {
    console.error("Erreur getDoctors:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const getDoctorById = async (req, res) => {
  const { id } = req.params;

  try {
    const rapports = await sequelize.query(
      `SELECT r.id, r.date, r.motif, r.bilan, r.idVisiteur
       FROM rapport r
       WHERE r.idMedecin = ?
       ORDER BY r.date DESC`,
      {
        replacements: [id],
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const doctor = await Medecin.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ error: "Médecin non trouvé" });
    }

    return res.json({
      id: doctor.id,
      lastname: doctor.nom,
      firstname: doctor.prenom,
      phone: doctor.tel || "",
      address: doctor.adresse || "",
      speciality: doctor.specialitecomplementaire || "",
      department: doctor.departement || "",
      reports: rapports.map((r) => ({
        id: r.id,
        date: r.date,
        motiv: r.motif,
        balanceSheet: r.bilan,
        idVisiteur: r.idVisiteur,
      })),
    });
  } catch (error) {
    console.error("getDoctorById:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = { getDoctors, getDoctorById };
