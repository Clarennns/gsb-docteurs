const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const Medicament = sequelize.define(
    "Medicament",
    {
      id: { type: DataTypes.STRING(30), primaryKey: true },
      nomCommercial: DataTypes.STRING(100),
      composition: DataTypes.TEXT,
      effets: DataTypes.TEXT,
      contreIndications: DataTypes.TEXT,
      idFamille: {
        type: DataTypes.STRING(10),
        references: {
          model: "famille",
          key: "id",
        },
      },
    },
    { tableName: "medicament", timestamps: false },
  );

  Medicament.associate = (models) => {
    Medicament.belongsTo(models.Famille, {
      foreignKey: "idFamille",
      targetKey: "id",
    });
    Medicament.belongsToMany(models.Rapport, {
      through: models.Offrir,
      foreignKey: "idMedicament",
      otherKey: "idRapport",
    });
  };

  return Medicament;
};
