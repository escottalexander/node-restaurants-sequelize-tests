'use strict';

const {Restaurant} = require('./restaurant');
const {Grade} = require('./grade');

const db = {
    Restaurant,
    Grade
};

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
