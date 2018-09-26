const express = require('express');
const router = express.Router();

const {
  Grade
} = require('../models');


router.get('/:id', (req, res) => Grade.findById(req.params.id, {

  })
  .then(grade => res.json(grade.apiRepr()))
);

// can create a new grade
router.post('/', (req, res) => {
  // ensure we have required fields
  const requiredFields = ['restaurant_id', 'grade', 'score', 'inspectionDate'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  return Grade
    .create({
      restaurant_id: req.body.restaurant_id,
      grade: req.body.grade,
      score: req.body.score,
      inspectionDate: req.body.inspectionDate,
    })
    .then(grade => res.status(201).json(grade.apiRepr()))
    .catch(err => res.status(500).send({
      message: err.message
    }));
});

// update a grade
router.put('/:id', (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id.toString())) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    res.status(400).json({
      message: message
    });
  }


  const toUpdate = {};
  const updateableFields = ['restaurant_id', 'grade', 'score', 'inspectionDate'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  return Grade
    // all key/value pairs in toUpdate will be updated.
    .update(toUpdate, {
      // we only update grades that have the id we sent in.
      where: {
        id: req.params.id
      }
    })
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({
      message: 'Internal server error'
    }));
});

// can delete a grade by id
router.delete('/:id', (req, res) => {
  return Grade
    .destroy({
      where: {
        id: req.params.id
      }
    })
    .then(grade => res.status(204).end())
    .catch(err => res.status(500).json({
      message: 'Internal server error'
    }));
});


module.exports = router;