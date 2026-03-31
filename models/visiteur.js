const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const Visiteur = sequelize.define(
    "Visiteur",
    {
      id: { type: DataTypes.CHAR(4), primaryKey: true },
      nom: {
        type: DataTypes.CHAR(30),
        get() {
          return this.getDataValue("nom")?.trim();
        },
      },
      prenom: {
        type: DataTypes.CHAR(30),
        get() {
          return this.getDataValue("prenom")?.trim();
        },
      },
      login: {
        type: DataTypes.CHAR(20),
        get() {
          return this.getDataValue("login")?.trim();
        },
      },
      mdp: {
        type: DataTypes.CHAR(20),
        get() {
          return this.getDataValue("mdp")?.trim();
        },
      },
      adresse: {
        type: DataTypes.CHAR(30),
        get() {
          return this.getDataValue("adresse")?.trim();
        },
      },
      cp: {
        type: DataTypes.CHAR(5),
        get() {
          return this.getDataValue("cp")?.trim();
        },
      },
      ville: {
        type: DataTypes.CHAR(30),
        get() {
          return this.getDataValue("ville")?.trim();
        },
      },
      dateEmbauche: DataTypes.DATEONLY,
    },
    { tableName: "visiteur", timestamps: false },
  );

  Visiteur.associate = (models) => {
    Visiteur.hasMany(models.Rapport, {
      foreignKey: "idVisiteur",
      sourceKey: "id",
    });
  };

  return Visiteur;
};
