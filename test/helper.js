const {PORT} = require('../config');
const {runServer, closeServer} = require('../server');
const {sequelize} = require('../models');

before(function() {
  return sequelize
    .sync({force: true})
    .then(() => runServer(PORT));
});

after(function() {
    return closeServer();
});