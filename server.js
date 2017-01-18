const {PORT} = require('./config');
const app = require('./app')
const {sequelize} = require('./db/sequelize');


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
    sequelize.close();
    console.log('Closing server');
    server.close(err => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

if (require.main === module) {
  runServer(PORT).catch(
    err => {
      console.error(`Can't start server: ${err}`);
      throw err;
    });
};

module.exports = {runServer, closeServer};
