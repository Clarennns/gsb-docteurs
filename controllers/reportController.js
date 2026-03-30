const jwtService = require("../services/jwtService");
const {
  sequelize,
  Sequelize,
  Rapport,
  Offrir,
  Visiteur,
  Medecin,
  Medicament,
} = require("../models");

const getVisiteurFromToken = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const tokenIsValid = jwtService.validateToken(token);
  const tokenIsBlacklisted = jwtService.isBlacklisted(token);
  const claims = jwtService.getClaims(token);
  const visiteurId = claims?.id;

  if (!tokenIsValid || tokenIsBlacklisted || !visiteurId) {
    return null;
  }

  const visiteur = await Visiteur.findByPk(visiteurId);
  return visiteur || null;
};

const normalizeMedicinesInput = (payload) => {
  if (Array.isArray(payload?.medicines)) {
    return payload.medicines
      .map((item) => ({
        medicineId: String(item?.medicineId || "").trim(),
        quantity: Number(item?.quantity),
      }))
      .filter(
        (item) =>
          item.medicineId &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0,
      );
  }

  if (
    payload?.medicineId &&
    Number.isInteger(Number(payload?.quantity)) &&
    Number(payload.quantity) > 0
  ) {
    return [
      {
        medicineId: String(payload.medicineId).trim(),
        quantity: Number(payload.quantity),
      },
    ];
  }

  return [];
};

const attachMedicines = async (reportId, medicines, transaction) => {
  if (!medicines.length) {
    return;
  }

  const medicineIds = [...new Set(medicines.map((m) => m.medicineId))];
  const existing = await Medicament.findAll({
    where: { id: medicineIds },
    attributes: ["id"],
    transaction,
  });

  if (existing.length !== medicineIds.length) {
    throw new Error("MEDICINE_NOT_FOUND");
  }

  await Offrir.destroy({ where: { idRapport: reportId }, transaction });
  await Offrir.bulkCreate(
    medicines.map((m) => ({
      idRapport: reportId,
      idMedicament: m.medicineId,
      quantite: m.quantity,
    })),
    { transaction },
  );
};

const getReports = async (req, res) => {
  const page = parseInt(req.query.page || "1", 10);
  const element = parseInt(req.query.element || "10", 10);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(element) ||
    element < 1
  ) {
    return res
      .status(400)
      .json({ error: "page et element doivent etre des entiers positifs" });
  }

  const offset = (page - 1) * element;

  try {
    const { count, rows } = await Rapport.findAndCountAll({
      order: [["date", "DESC"]],
      limit: element,
      offset,
      include: [
        { model: Visiteur, attributes: ["id", "nom", "prenom"] },
        { model: Medecin, attributes: ["id", "nom", "prenom"] },
      ],
    });

    const response = rows.map((report) => ({
      id: report.id,
      date: report.date,
      motive: report.motif,
      balanceSheet: report.bilan,
      visitor: report.Visiteur
        ? {
            id: report.Visiteur.id,
            lastname: report.Visiteur.nom,
            firstname: report.Visiteur.prenom,
          }
        : null,
      doctor: report.Medecin
        ? {
            id: report.Medecin.id,
            lastname: report.Medecin.nom,
            firstname: report.Medecin.prenom,
          }
        : null,
    }));

    res.json({
      reports: response,
      currentPage: page,
      totalPages: Math.ceil(count / element),
    });
  } catch (error) {
    console.error("getReports:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const getReportById = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Identifiant de rapport invalide" });
  }

  try {
    const report = await Rapport.findByPk(id, {
      include: [
        { model: Visiteur, attributes: ["id", "nom", "prenom"] },
        { model: Medecin, attributes: ["id", "nom", "prenom"] },
      ],
    });

    if (!report) {
      return res.status(404).json({ error: "Rapport non trouvé" });
    }

    const medicines = await sequelize.query(
      `SELECT o.idMedicament as id,
                    o.quantite as quantity,
                    m.nomCommercial as businessName
             FROM offrir o
             INNER JOIN medicament m ON m.id = o.idMedicament
             WHERE o.idRapport = ?
             ORDER BY m.nomCommercial ASC`,
      {
        replacements: [id],
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const response = {
      id: report.id,
      date: report.date,
      motive: report.motif,
      balanceSheet: report.bilan,
      visitor: report.Visiteur
        ? {
            id: report.Visiteur.id,
            lastname: report.Visiteur.nom,
            firstname: report.Visiteur.prenom,
          }
        : null,
      doctor: report.Medecin
        ? {
            id: report.Medecin.id,
            lastname: report.Medecin.nom,
            firstname: report.Medecin.prenom,
          }
        : null,
      medicines,
    };

    res.json(response);
  } catch (error) {
    console.error("getReportById error:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const createReport = async (req, res) => {
  const visiteur = await getVisiteurFromToken(req);
  if (!visiteur) {
    return res
      .status(401)
      .json({ error: "Token manquant ou incorrect ou visiteur inexistant" });
  }

  const { balanceSheet, motive, doctorId, date } = req.body;
  const medicines = normalizeMedicinesInput(req.body);
  const parsedDoctorId = Number(doctorId);

  if (
    !balanceSheet ||
    !motive ||
    !parsedDoctorId ||
    !date ||
    medicines.length === 0
  ) {
    return res.status(400).json({
      error:
        "balanceSheet, motive, doctorId, date et au moins un medicament sont requis",
    });
  }

  try {
    const medecin = await Medecin.findByPk(parsedDoctorId);
    if (!medecin) {
      return res.status(400).json({ error: "Ce medecin n existe pas" });
    }

    const transaction = await sequelize.transaction();
    try {
      const report = await Rapport.create(
        {
          date,
          motif: motive,
          bilan: balanceSheet,
          idVisiteur: visiteur.id,
          idMedecin: medecin.id,
        },
        { transaction },
      );

      await attachMedicines(report.id, medicines, transaction);
      await transaction.commit();

      res.status(201).json({
        data: {
          id: report.id,
        },
        message: "Le rapport a ete cree",
      });
    } catch (e) {
      await transaction.rollback();
      if (e.message === "MEDICINE_NOT_FOUND") {
        return res
          .status(400)
          .json({ error: "Un ou plusieurs medicaments sont invalides" });
      }
      throw e;
    }
  } catch (error) {
    console.error("createReport:", error.message);
    res.status(500).json({ error: "Erreur creation" });
  }
};

const updateReport = async (req, res) => {
  const visiteur = await getVisiteurFromToken(req);
  if (!visiteur) {
    return res
      .status(401)
      .json({ error: "Token manquant ou incorrect ou visiteur inexistant" });
  }

  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Identifiant de rapport invalide" });
  }

  const { balanceSheet, motive, doctorId, date } = req.body;
  const medicines = normalizeMedicinesInput(req.body);
  const parsedDoctorId = Number(doctorId);

  if (!balanceSheet || !motive || !parsedDoctorId || !date) {
    return res.status(400).json({
      error:
        "balanceSheet, motive, doctorId et date sont requis pour la mise a jour",
    });
  }

  try {
    const report = await Rapport.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: "Rapport non trouve" });
    }

    if (report.idVisiteur !== visiteur.id) {
      return res
        .status(403)
        .json({ error: "Modification non autorisee pour ce rapport" });
    }

    const medecin = await Medecin.findByPk(parsedDoctorId);
    if (!medecin) {
      return res.status(400).json({ error: "Ce medecin n existe pas" });
    }

    const transaction = await sequelize.transaction();
    try {
      await report.update(
        {
          date,
          motif: motive,
          bilan: balanceSheet,
          idMedecin: medecin.id,
        },
        { transaction },
      );

      if (medicines.length > 0) {
        await attachMedicines(report.id, medicines, transaction);
      }

      await transaction.commit();
      return res.json({ message: "Rapport mis a jour" });
    } catch (e) {
      await transaction.rollback();
      if (e.message === "MEDICINE_NOT_FOUND") {
        return res
          .status(400)
          .json({ error: "Un ou plusieurs medicaments sont invalides" });
      }
      throw e;
    }
  } catch (error) {
    console.error("updateReport:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

const deleteReport = async (req, res) => {
  const visiteur = await getVisiteurFromToken(req);
  if (!visiteur) {
    return res
      .status(401)
      .json({ error: "Token manquant ou incorrect ou visiteur inexistant" });
  }

  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Identifiant de rapport invalide" });
  }

  try {
    const report = await Rapport.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: "Rapport non trouve" });
    }

    if (report.idVisiteur !== visiteur.id) {
      return res
        .status(403)
        .json({ error: "Suppression non autorisee pour ce rapport" });
    }

    const transaction = await sequelize.transaction();
    try {
      await Offrir.destroy({ where: { idRapport: id }, transaction });
      await report.destroy({ transaction });
      await transaction.commit();
      return res.status(204).send();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  } catch (error) {
    console.error("deleteReport:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

const getReportsByVisitor = async (req, res) => {
  const { visiteurId } = req.params;

  try {
    const visitor = await Visiteur.findByPk(visiteurId);
    if (!visitor) {
      return res.status(404).json({ error: "Visiteur non trouve" });
    }

    const reports = await Rapport.findAll({
      where: { idVisiteur: visiteurId },
      order: [["date", "DESC"]],
      include: [{ model: Medecin, attributes: ["id", "nom", "prenom"] }],
    });

    return res.json({
      visitor: {
        id: visitor.id,
        lastname: visitor.nom,
        firstname: visitor.prenom,
      },
      reports: reports.map((r) => ({
        id: r.id,
        date: r.date,
        motive: r.motif,
        balanceSheet: r.bilan,
        doctor: r.Medecin
          ? {
              id: r.Medecin.id,
              lastname: r.Medecin.nom,
              firstname: r.Medecin.prenom,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("getReportsByVisitor:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  getReportsByVisitor,
};
