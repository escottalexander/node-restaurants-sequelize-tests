const express = require('express');
const router = express.Router();

const {Restaurant, Grade} = require('../models');


router.get('/grades/:id', (req, res) => {
  Grade
  .findById(req.params.id)
  .then(grade => res.json(grade.apiRepr()));
});

router.post('/grades', (req, res) => {

});

router.put('/grades', (req, res) => {

});

router.delete('/grades/:id', (req, res) => {

});

module.exports = router;
