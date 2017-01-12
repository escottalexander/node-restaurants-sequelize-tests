const {PORT} = require('./config');
const app = require('./app')
const {sequelize} = require('./models');


let server;

function runServer(port) {
  return new Promise((resolve, reject) => {
    try {
      server = app.listen(port, () => {
        console.log(`App listening on port ${port}`);
        resolve();
      });
    }
    catch (err) {
      console.error(`Can't start server: ${err}`);
      reject(err);
    }
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    // not a promise yet, but will be soon?
    // https://github.com/sequelize/sequelize/pull/5776
    try {
      console.log('Closing server');
      server.close();
      console.log('Disconnecting from db');
      sequelize.close();
      resolve();
    }
    catch(err) {
      sequelize.close();
      reject(err);
    }
  });
}

if (require.main === module) {
  runServer(PORT).catch(
    err => {
      console.error(`Can't start server: ${err}`);
      throw err;
    });
};

module.exports = {runServer, closeServer, app};