const express = require('express');
const router = express.Router();

const {Restaurant, Grade} = require('../models');

router.get('/', (req, res) => Restaurant.findAll(
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

router.get('/:id', (req, res) => {
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


router.post('/', (req, res) => {
    // validate request parameters as in earlier router
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

router.delete('/:id', (req, res) => {
  Restaurant
    .destroy({
      where: {
        id: req.params.id
      }
    })
    .then(restaurant => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.get('/:id/grades', (req, res) => {
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

module.exports = router;