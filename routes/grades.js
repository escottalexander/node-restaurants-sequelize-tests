const express = require('express');
const router = express.Router();

const {Restaurant, Grade} = require('../models');


router.get('/:id', (req, res) => {
  Grade
  .findById(req.params.id)
  .then(grade => res.json(grade.apiRepr()));
});

router.post('/', (req, res) => {

});

router.put('/', (req, res) => {

});

router.delete('/:id', (req, res) => {

});

module.exports = router;
