const Sequelize = require('sequelize');
const {DataTypes} = Sequelize;

'use strict';
module.exports = function(sequelize) {
  var Grade = sequelize.define('Grade', {
    grade: {
      type: DataTypes.STRING,
      allowNull: false
    },
    inspectionDate: {
      type: DataTypes.DATE,
      field: 'inspection_date',
      allowNull: false,
    },
    score: DataTypes.INTEGER
  }, {
    tableName: 'grades',
    underscored: true,
    classMethods: {
      associate: function(models) {
        Grade.belongsTo(models.Restaurant);
      }
    },
    instanceMethods: {
      apiRepr: function() {
        return {
          id: this.id,
          grade: this.grade,
          inspectionDate: this.inspectionDate,
          score: this.score
        }
      }
    }
  });
  return Grade;
};