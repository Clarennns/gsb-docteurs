const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    return sequelize.define('Famille', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        libelle: DataTypes.STRING(100)
    }, { tableName: 'famille', timestamps: false });
};
