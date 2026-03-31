const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const Rapport = sequelize.define(
    "Rapport",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      date: DataTypes.DATEONLY,
      motif: DataTypes.TEXT,
      bilan: DataTypes.TEXT,
      idMedecin: DataTypes.INTEGER,
      idVisiteur: DataTypes.CHAR(4),
    },
    { tableName: "rapport", timestamps: false },
  );

  Rapport.associate = (models) => {
    Rapport.belongsTo(models.Visiteur, {
      foreignKey: "idVisiteur",
      targetKey: "id",
    });
    Rapport.belongsTo(models.Medecin, {
      foreignKey: "idMedecin",
      targetKey: "id",
    });
    Rapport.belongsToMany(models.Medicament, {
      through: models.Offrir,
      foreignKey: "idRapport",
      otherKey: "idMedicament",
    });
  };

  return Rapport;
};
