const express = require('express');
const router = express.Router();

const {Restaurant, Grade} = require('../models');

// can get all restaurants, but we limit to 50 so we don't
// send back all ~25k records.
router.get('/', (req, res) => Restaurant.findAll(
  // The `include` part will cause each restaurant's grades,
  // if any, to be eager loaded. That means that the
  // related grade data is fetched from the db at the same
  // time as the restaurant data. We need both data sources
  // available for our `.apiRepr` method to work when we call
  // it on each restaurant below.
  {
    limit: 50,
    include: [{
        model: Grade,
        // since we're setting `tableName` in our model definition for `Grade`,
        // we need to use `as` here with the same table name, otherwise
        // Sequelize won't find it.
        as: 'grades'
    }]
  })
  .then(restaurants => res.json({
    restaurants: restaurants.map(rest => rest.apiRepr())
  }))
);

// can get individual restaurants by id
router.get('/:id', (req, res) => Restaurant.findById(req.params.id, {
      // see notes on `include` from route for `/`, above
      include: [{
          model: Grade,
          // since we're setting `tableName` in our model definition for `Grade`,
          // we need to use `as` here with the same table name
          as: 'grades'
      }]
  })
  .then(restaurant => res.json(restaurant.apiRepr()))
);

// can create a new restaurant
router.post('/', (req, res) => {
  // ensure we have required fields
  const requiredFields = ['name', 'borough', 'cuisine'];
  requiredFields.forEach(field => {
    // ensure that required fields have been sent over
    if (! (field in req.body && req.body[field])) {
        return res.status(400).json({message: `Must specify value for ${field}`});
     }
  });
  // `.create` creates a new instance and saves it to the db
  // in a single step.
  // http://docs.sequelizejs.com/en/latest/api/model/#createvalues-options-promiseinstance
  return Restaurant
    .create({
      name: req.body.name,
      borough: req.body.borough,
      cuisine: req.body.cuisine,
      addressBuildingNumber: req.body.addressBuildingNumber,
      addressStreet: req.body.addressStreet,
      addressZipcode: req.body.addressZipcode
    })
    .then(restaurant => res.status(201).json(restaurant.apiRepr()))
    .catch(err => res.status(500).send({message: err.message}));
});

// update a restaurant
router.put('/:id', (req, res) => {
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

  return Restaurant
    // all key/value pairs in toUpdate will be updated.
    .update(toUpdate, {
      // we only update restaurants that have the id we sent in.
      where: {
        id: req.params.id
      }
    })
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

// can delete a restaurant by id
router.delete('/:id', (req, res) => {
  return Restaurant
    .destroy({
      where: {
        id: req.params.id
      }
    })
    .then(restaurant => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

// can retrieve all the grades, if any, for a restaurant
router.get('/:id/grades', (req, res) => {
  return Restaurant
    .findById(req.params.id, {
      // see notes in route for `/` above, for discussion of `include`
      // and eager loading.
      include: [{
          model: Grade,
          // since we're setting `tableName` in our model definition for `Grade`,
          // we need to use `as` here with the same table name
          as: 'grades'
      }]
    })
    .then(restaurant => res.json({
      grades: restaurant.grades.map(grade => grade.apiRepr())
    }));
});

module.exports = router;