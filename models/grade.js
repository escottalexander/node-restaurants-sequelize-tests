'use strict';

// we need the Sequelize library in order to
// get the different data types for model properties
// (for instance, `Sequelize.string`).
const Sequelize = require('sequelize');
// we should only have one sequelize instance in our
// whole app, which we can import here and other model
// files.
const {
  sequelize
} = require('../db/sequelize');


const Grade = sequelize.define('Grade', {
  grade: {
    type: Sequelize.STRING,
    // this stops this column from being blank
    allowNull: false
  },
  inspectionDate: {
    type: Sequelize.DATE,
    // in our JS code, we'll refer to this property
    // as `inspectionDate`, but in the db, the column
    // name will be `inspection_date`.
    field: 'inspection_date',
    allowNull: false,
  },
  score: Sequelize.INTEGER
}, {
  // we explicitly tell Sequelize that this model is linked
  // to a table named 'grades' instead of having Sequelize
  // automatically determine table names, which can be error
  // prone
  tableName: 'grades',

  // this options ensures that if sequelize creates any
  // tables on behalf of this model (which in this app only
  // happens when we call `sequelize.sync` in our tests), camelCased
  // column names will be converted to snake_case for the database.
  underscored: true,
  classMethods: {
    // relations between models are declared in `.classMethods.associate`.
    associate: function (models) {
      Grade.belongsTo(
        models.Restaurant,
        // this is how we make grade.restaurant_id non-nullable
        // and ensure that when a restaurant is deleted, so to
        // are its grades. note that this correlates to the
        // relationships we've established in
        // migrations/migrations/0001_restaurants_and_grades_initial.sql
        {
          foreignKey: {
            allowNull: false
          },
          onDelete: 'CASCADE'
        }
      );
    }
  },
  instanceMethods: {
    // we'll use this instance method to create a standard
    // standard representation of this resource in our app.
    apiRepr: function () {
      return {
        id: this.id,
        grade: this.grade,
        inspectionDate: this.inspectionDate,
        score: this.score
      }
    }
  }
});

// Although we export `Grade` here, any code that needs `Grade`
// should import it from `./models/index.js` (so, for instance,
// `const {Grade} = require('./models')`).
module.exports = {
  Grade
};