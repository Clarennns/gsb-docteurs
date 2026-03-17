const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    return sequelize.define('Medicament', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nomCommercial: DataTypes.STRING(100),
        composition: DataTypes.TEXT,
        effets: DataTypes.TEXT,
        contreIndications: DataTypes.TEXT,
        idFamille: {  // ← FK exact
            type: DataTypes.INTEGER,
            references: {
                model: 'Famille',
                key: 'id'
            }
        }
    }, { tableName: 'medicament', timestamps: false });
};
