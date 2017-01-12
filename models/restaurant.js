'use strict';
module.exports = function(sequelize, DataTypes) {
  var Restaurant = sequelize.define('Restaurant', {
    name: DataTypes.TEXT,
    borough: DataTypes.ENUM('Brooklyn', 'Bronx', 'Manhattan', 'Queens', 'Staten Island'),
    cuisine: DataTypes.TEXT,
    addressStreet: {
      type: DataTypes.TEXT,
      field: 'address_street'
    },
    addressBuildingNumber: {
      type: DataTypes.TEXT,
      field: 'address_building_number'
    },
    addressZipcode: {
      type: DataTypes.TEXT,
      field: 'address_zipcode'
    }
  }, {
    tableName: 'restaurants',
    underscoreall: true,
    underscored: true,
    getterMethods: {
      mostRecentGrade: function() {
        // http://stackoverflow.com/a/4020842/1264950
        let mostRecent = null;
        (this.getDataValue('grades') || []).forEach(grade => {
          if (!mostRecent || grade.inspectionDate > mostRecent.inspectionDate) {
            mostRecent = grade;
          }
        })
        return mostRecent;
      }
    },
    classMethods: {
      associate: function(models) {
        Restaurant.hasMany(models.Grade, {as: 'grades', onDelete: 'CASCADE'});
      }
    },
    instanceMethods: {
      apiRepr: function() {
        return {
          id: this.getDataValue('id'),
          name: this.getDataValue('name'),
          cuisine: this.getDataValue('cuisine'),
          borough: this.getDataValue('borough'),
          address: {
            number: this.getDataValue('addressBuildingNumber'),
            street: this.getDataValue('addressStreet'),
            zip: this.getDataValue('addressZipcode')
          },
          mostRecentGrade: this.mostRecentGrade ? this.mostRecentGrade.apiRepr() : null
        }
      }
    }
  });
  return Restaurant;
};