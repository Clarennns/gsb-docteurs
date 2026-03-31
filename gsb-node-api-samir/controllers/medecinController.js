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
        "departement",
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
        departement: doctor.departement || "",
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

const createDoctor = async (req, res) => {
  const { nom, prenom, tel, adresse, specialitecomplementaire, departement } =
    req.body;

  if (!nom || !prenom) {
    return res.status(400).json({
      error: "nom et prenom sont requis",
    });
  }

  try {
    const doctor = await Medecin.create({
      nom: String(nom || "").trim(),
      prenom: String(prenom || "").trim(),
      tel: String(tel || "").trim(),
      adresse: String(adresse || "").trim(),
      specialitecomplementaire: String(specialitecomplementaire || "").trim(),
      departement: String(departement || "").trim(),
    });

    return res.status(201).json({
      data: {
        id: doctor.id,
      },
      message: "Medecin cree",
    });
  } catch (error) {
    console.error("createDoctor:", error.message || error);
    // More detailed error for debugging
    const errorMessage = error.message || "Erreur creation";
    return res.status(500).json({
      error: "Erreur creation",
      details: errorMessage,
    });
  }
};

const updateDoctor = async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, tel, adresse, specialitecomplementaire, departement } =
    req.body;

  if (!nom || !prenom) {
    return res.status(400).json({
      error: "nom et prenom sont requis",
    });
  }

  try {
    const doctor = await Medecin.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ error: "Medecin non trouve" });
    }

    await doctor.update({
      nom: String(nom || "").trim(),
      prenom: String(prenom || "").trim(),
      tel: String(tel || "").trim(),
      adresse: String(adresse || "").trim(),
      specialitecomplementaire: String(specialitecomplementaire || "").trim(),
      departement: String(departement || "").trim(),
    });

    return res.json({ message: "Medecin mis a jour" });
  } catch (error) {
    console.error("updateDoctor:", error.message || error);
    // More detailed error for debugging
    const errorMessage = error.message || "Erreur modification";
    return res.status(500).json({
      error: "Erreur modification",
      details: errorMessage,
    });
  }
};

const deleteDoctor = async (req, res) => {
  const { id } = req.params;

  try {
    const doctor = await Medecin.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ error: "Medecin non trouve" });
    }

    const reportsCount = await sequelize.query(
      "SELECT COUNT(*) as total FROM rapport WHERE idMedecin = ?",
      {
        replacements: [id],
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    if (reportsCount[0].total > 0) {
      return res.status(400).json({
        error: "Impossible de supprimer un medecin qui a des rapports associes",
        hasReports: true,
      });
    }

    await doctor.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("deleteDoctor:", error.message);
    return res.status(500).json({ error: "Erreur suppression" });
  }
};

const forceDeleteDoctor = async (req, res) => {
  const { id } = req.params;

  try {
    const doctor = await Medecin.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ error: "Medecin non trouve" });
    }

    const transaction = await sequelize.transaction();
    try {
      await sequelize.query(
        `DELETE FROM offrir WHERE idRapport IN (
          SELECT id FROM rapport WHERE idMedecin = ?
        )`,
        {
          replacements: [id],
          type: Sequelize.QueryTypes.DELETE,
          transaction,
        },
      );

      await sequelize.query("DELETE FROM rapport WHERE idMedecin = ?", {
        replacements: [id],
        type: Sequelize.QueryTypes.DELETE,
        transaction,
      });

      await doctor.destroy({ transaction });

      await transaction.commit();
      return res.status(204).send();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  } catch (error) {
    console.error("forceDeleteDoctor:", error.message);
    return res.status(500).json({ error: "Erreur suppression" });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  forceDeleteDoctor,
};
