const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    const Visiteur = sequelize.define('Visiteur', {
        id: { type: DataTypes.CHAR(4), primaryKey: true },
        nom: DataTypes.CHAR(30),
        prenom: DataTypes.CHAR(30),
        login: DataTypes.CHAR(20),
        mdp: DataTypes.CHAR(20),
        adresse: DataTypes.CHAR(30),
        cp: DataTypes.CHAR(5),
        ville: DataTypes.CHAR(30),
        dateEmbauche: DataTypes.DATEONLY
    }, { tableName: 'visiteur', timestamps: false });
    return Visiteur;
};