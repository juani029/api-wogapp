const {DataTypes} = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.

module.exports = (sequelize) => {
    sequelize.define('genre', {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          unique: true,
          defaultValue: DataTypes.UUIDV4
        },
        name: {
          type: DataTypes.TEXT
        }
      }, {
        timestamps: false,
        createdAt: false,
        updatedAt: false
      });
}