const express = require('express');
const router = express.Router();

const {Grade} = require('../models');

// requests for individual grades by id
router.get('/:id', (req, res) => {
  return Grade
    // http://docs.sequelizejs.com/en/latest/api/model/#findbyidid-options-promiseinstance
    .findById(req.params.id)
    .then(grade => res.json(grade.apiRepr()));
});

// create a grade
router.post('/', (req, res) => {
  const requiredFields = ['grade', 'restaurantId'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  // `.create` creates a new instance and saves it to the db
  // in a single step.
  // http://docs.sequelizejs.com/en/latest/api/model/#createvalues-options-promiseinstance
  return Grade.create({
    // Unfortunately, even though we've set the `underscored` option
    // on our model definition for Grade, we must refer to
    // the restaurant id foreign key by its name in the db. Sequelize
    // knows how to do that for `inspectionDate` but not `restaurant_id`,
    // apparently because it's a foreign key.
    restaurant_id: req.body.restaurantId,
    grade: req.body.grade,
    score: req.body.score,
    inspectionDate: req.body.inspectionDate,
  })
  // if successful send a 201 and an object representing the newly
  // created grade
  .then(grade => {
    return res.status(201).json(grade.apiRepr())
  })
  .catch(err => {
    return res.status(500).send({message: err.message});
  });
});

// update an existing grade
router.put('/:id', (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id.toString())) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    res.status(400).json({message: message});
  }

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {};
  const updateableFields = ['score', 'grade', 'inspectionDate', 'restaurantId'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  return Grade
    // http://docs.sequelizejs.com/en/latest/api/model/#updatevalues-options-promisearrayaffectedcount-affectedrows
    .update(toUpdate, {
      // http://docs.sequelizejs.com/en/latest/docs/querying/#where
      where: {
        id: req.params.id
      }
    })
    .then(() => {
      // send back status code 204 to indicate success but no content
      res.status(204).end()
    })
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

// delete a grade
router.delete('/:id', (req, res) => {
  return Grade
    // http://docs.sequelizejs.com/en/latest/api/model/#destroyoptions-promiseinteger
    .destroy({
      // http://docs.sequelizejs.com/en/latest/docs/querying/#where
      where: {
        id: req.params.id
      }
    })
    // send back status code 204 to indicate success but no content
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;
