const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    return sequelize.define('Rapport', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        date: DataTypes.DATEONLY,
        motif: DataTypes.TEXT,
        bilan: DataTypes.TEXT,
        idMedecin: DataTypes.INTEGER,
        idVisiteur: DataTypes.INTEGER
    }, { tableName: 'rapport', timestamps: false });
};
