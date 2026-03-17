const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    return sequelize.define('Offrir', {
        idRapport: { type: DataTypes.INTEGER, primaryKey: true },
        idMedicament: { type: DataTypes.STRING(30), primaryKey: true },
        quantite: { type: DataTypes.SMALLINT }
    }, { tableName: 'offrir', timestamps: false });
};
