const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const Famille = sequelize.define(
    "Famille",
    {
      id: { type: DataTypes.STRING(10), primaryKey: true },
      libelle: DataTypes.STRING(100),
    },
    { tableName: "famille", timestamps: false },
  );

  Famille.associate = (models) => {
    Famille.hasMany(models.Medicament, {
      foreignKey: "idFamille",
      sourceKey: "id",
    });
  };

  return Famille;
};
