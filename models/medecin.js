const {DataTypes} = require('sequelize');
module.exports = (sequelize) => {
    const Medecin = sequelize.define('Medecin', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        nom: DataTypes.STRING(100),
        prenom: DataTypes.STRING(100),
        tel: DataTypes.STRING(20),
        adresse: DataTypes.STRING(255),
        specialitecomplementaire: DataTypes.STRING(255),
        departement: DataTypes.STRING(100)
    }, {tableName: 'medecin', timestamps: false});

    return Medecin;
};
