const { Medicament, Famille } = require("../models");
const { Op } = require("sequelize");

const getMedicines = async (req, res) => {
  const page = req.query.page || 1;
  const element = req.query.element || 10;
  const name = req.query.name || "";
  const nameOrder = req.query.order_name || "ASC";

  const offset = (parseInt(page) - 1) * parseInt(element);

  const where = name
    ? {
        nomCommercial: { [Op.like]: `%${name}%` },
      }
    : {};

  try {
    const { count, rows: medicines } = await Medicament.findAndCountAll({
      where,
      order: [["nomCommercial", nameOrder]],
      limit: parseInt(element),
      offset,
      attributes: [
        "id",
        "nomCommercial",
        "composition",
        "effets",
        "contreIndications",
        "idFamille",
      ],
    });

    const response = { medicines: [] };

    // Boucle : récupère famille SANS raw query
    for (const medicine of medicines) {
      let familleLibelle = "";
      if (medicine.idFamille) {
        const famille = await Famille.findByPk(medicine.idFamille);
        familleLibelle = famille ? famille.libelle : "";
      }

      response.medicines.push({
        id: medicine.id,
        "business name": medicine.nomCommercial,
        family: familleLibelle,
        composition: medicine.composition || "",
        effects: medicine.effets || "",
        againstIndications: medicine.contreIndications || "",
      });
    }

    response.currentPage = page !== null ? page : 1;
    response.totalPages = element !== null ? Math.ceil(count / element) : 1;

    res.json(response);
  } catch (error) {
    console.error("Erreur getMedicines:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = { getMedicines };
