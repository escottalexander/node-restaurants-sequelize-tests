const express = require('express');
const router = express.Router();

const {Restaurant, Grade} = require('../models');


router.get('/:id', (req, res) => {
  Grade
  .findById(req.params.id)
  .then(grade => res.json(grade.apiRepr()));
});

router.post('/', (req, res) => {
  const requiredFields = ['grade', 'restaurantId'];
  requiredFields.forEach(field => {
    // ensure that required fields have been sent over
    if (! (field in req.body && req.body[field])) {
        return res.status(400).json({message: `Must specify value for ${field}`});
     }
  });
  return Grade.create({
    // Sequelize doesn't convert to camelcase for us :(
    restaurant_id: req.body.restaurantId,
    grade: req.body.grade,
    score: req.body.score,
    inspectionDate: req.body.inspectionDate,
  })
  .then(grade => {
    return res.status(201).json(grade.apiRepr())
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

  Grade
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
  Grade
    .destroy({
      where: {
        id: req.params.id
      }
    })
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;
