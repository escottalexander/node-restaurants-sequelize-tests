const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');

const {Restaurant, Grade, sequelize} = require('./models');
const {PORT} = require('./config');

// Set up the express app
const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());


app.get('/restaurants', (req, res) => Restaurant.findAll(
  // limit results to 10 so we don't send back all ~25,000
  // if you're using backup data. The `include` part will cause
  // each restaurant's grades, if any, to be eager loaded,
  // which we need to do to make them available when
  // `apiRepr` is called below.
  {
    limit: 10,
    include: [{
        model: Grade,
        // since we're setting `tableName` in our model definition for `Grade`,
        // we need to use `as` here with the same table name
        as: 'grades'
    }]
  })
  .then(restaurants => res.json({
    restaurants: restaurants.map(rest => rest.apiRepr())}
  )));

app.get('/restaurants/:id', (req, res) => {
    Restaurant.findById(req.params.id, {
        include: [{
            model: Grade,
            // since we're setting `tableName` in our model definition for `Grade`,
            // we need to use `as` here with the same table name
            as: 'grades'
        }]
    })
    .then(restaurant => {
        res.json(restaurant.apiRepr())
    });
})


app.post('/restaurants', (req, res) => {
    // validate request parameters as in earlier app
    const requiredFields = ['name', 'borough', 'cuisine'];
    requiredFields.forEach(field => {
        // ensure that required fields have been sent over
        if (! (field in req.body && req.body[field])) {
            return res.status(400).json({message: `Must specify value for ${field}`});
         }
    });
    return Restaurant.create({
      name: req.body.name,
      borough: req.body.borough,
      cuisine: req.body.cuisine,
      addressBuildingNumber: req.body.addressBuildingNumber,
      addressStreet: req.body.addressStreet,
      addressZipcode: req.body.addressZipcode
    })
    .then(restaurant => {
      restaurant.apiRepr();
      return res.status(201).json(restaurant.apiRepr())
    })
    .catch(err => {
      return res.status(500).send({message: err.message});
    })
});

app.put('/restaurants/:id', (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id.toString())) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    res.status(400).json({message: message});
  }

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {};
  const updateableFields = ['name', 'borough', 'cuisine', 'addressBuildingNumber', 'addressStreet', 'addressZipcode'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Restaurant
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .update(toUpdate, {
      where: {
        id: req.params.id
      }
    })
    .then(() => {
      res.status(204).end()
    })
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.delete('/restaurants/:id', (req, res) => {
  Restaurant
    .destroy({
      where: {
        id: req.params.id
      }
    })
    .then(restaurant => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.get('/restaurants/:id/grades', (req, res) => {
  Restaurant
  .findById(req.params.id, {
    include: [{
        model: Grade,
        // since we're setting `tableName` in our model definition for `Grade`,
        // we need to use `as` here with the same table name
        as: 'grades'
    }]
  })
  .then(restaurant => restaurant.getGrades())
  .then(grades => res.json({
    grades: grades.map(grade => grade.apiRepr())}));
});

app.get('/grades/:id', (req, res) => {
  Grade
  .findById(req.params.id)
  .then(grade => res.json(grade.apiRepr()));
});

app.post('/grades', (req, res) => {

});

app.put('/grades', (req, res) => {

});

app.delete('/grades/:id', (req, res) => {

});


app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});


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
    console.log('Disconnecting from db');
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

module.exports = {runServer, closeServer, app};