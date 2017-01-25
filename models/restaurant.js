'use strict';

// we need the Sequelize library in order to
// get the different data types for model properties
// (for instance, `Sequelize.string`).
const Sequelize = require('sequelize');
// we should only have one sequelize instance in our
// whole app, which we can import here and other model
// files.
const {sequelize} = require('../db/sequelize');

const Restaurant = sequelize.define('Restaurant', {
    name: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    // for enumerated types, we use the `ENUM` data type,
    // along with the type options. Note that the values
    // that appear here are the same as the ones we create
    // in migrations/migrations/0001_restaurants_and_grades_initial.sql
    borough: Sequelize.ENUM('Brooklyn', 'Bronx', 'Manhattan', 'Queens', 'Staten Island'),
    cuisine: Sequelize.TEXT,
    addressStreet: {
      type: Sequelize.TEXT,
      // in our JS code, we'll refer to this property
      // as `addressStreet`, but in the db, the column
      // name will be `address_street`.
      field: 'address_street'
    },
    addressBuildingNumber: {
      type: Sequelize.TEXT,
      field: 'address_building_number'
    },
    addressZipcode: {
      type: Sequelize.TEXT,
      field: 'address_zipcode'
    }
  }, {
    // we explicitly tell Sequelize that this model is linked
    // to a table named 'grades' instead of having Sequelize
    // automatically determine table names, which can be error
    // prone
    tableName: 'restaurants',
    // this options ensures that if sequelize creates any
    // tables on behalf of this model (which in this app only
    // happens when we call `sequelize.sync` in our tests), camelCased
    // column names will be converted to snake_case for the database.
    underscored: true,
    getterMethods: {
      // all restaurant instances will have a `mostRecentGrade` property
      // available (accessed like `myRestaurant.mostRecentGrade`, *NOT*
      // `myRestaurant.mostRecentGrade()`) that returns the restaurant's
      // most recent grade, if any
      mostRecentGrade: function() {
        // http://stackoverflow.com/a/4020842/1264950
        let mostRecent = null;
        (this.grades || []).forEach(grade => {
          if (!mostRecent || grade.inspectionDate > mostRecent.inspectionDate) {
            mostRecent = grade;
          }
        })
        return mostRecent;
      }
    },
    classMethods: {
      // relations between models are declared in `.classMethods.associate`, which gets called
      // in `/models/index.js`
      associate: function(models) {
        Restaurant.hasMany(
          models.Grade,
          {
            as: 'grades',
            // this is how we make grade.restaurant_id non-nullable
            foreignKey: { allowNull: false },
            // when a restaurant is deleted, that should cascade
            // to its grades. note that this correlates with the
            // relationships we've established in
            // migrations/migrations/0001_restaurants_and_grades_initial.sql
            onDelete: 'CASCADE'
          });
      }
    },
    instanceMethods: {
      // we'll use this instance method to create a standard
      // standard representation of this resource in our app.
      apiRepr: function() {
        return {
          id: this.id,
          name: this.name,
          cuisine: this.cuisine,
          borough: this.borough,
          address: {
            number: this.addressBuildingNumber,
            street: this.addressStreet,
            zip: this.addressZipcode
          },
          mostRecentGrade: this.mostRecentGrade ? this.mostRecentGrade.apiRepr() : null
        }
      }
    }
  }
);

// Although we export `Restaurant` here, any code that needs `Restaurant`
// should import it from `./models/index.js` (so, for instance,
// `const {Restaurant} = require('./models')`).
module.exports = {
  Restaurant
};
