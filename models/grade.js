'use strict';

const Sequelize = require('sequelize');
const {sequelize} = require('../db/sequelize');

var Grade = sequelize.define('Grade', {
  grade: {
    type: Sequelize.STRING,
    allowNull: false
  },
  inspectionDate: {
    type: Sequelize.DATE,
    field: 'inspection_date',
    allowNull: false,
  },
  score: Sequelize.INTEGER
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

module.exports = {
  Grade
};
