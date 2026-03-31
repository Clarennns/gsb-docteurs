const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const Offrir = sequelize.define(
    "Offrir",
    {
      idRapport: { type: DataTypes.INTEGER, primaryKey: true },
      idMedicament: { type: DataTypes.STRING(30), primaryKey: true },
      quantite: { type: DataTypes.SMALLINT },
    },
    { tableName: "offrir", timestamps: false },
  );

  Offrir.associate = (models) => {
    Offrir.belongsTo(models.Rapport, {
      foreignKey: "idRapport",
      targetKey: "id",
    });
    Offrir.belongsTo(models.Medicament, {
      foreignKey: "idMedicament",
      targetKey: "id",
    });
  };

  return Offrir;
};
