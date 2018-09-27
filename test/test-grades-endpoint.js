const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const app = require('../app')
const {
  Restaurant,
  Grade
} = require('../models');

chai.use(chaiHttp);

function seedRestaurantData(seedNum = 10) {
  const restaurants = [];
  for (let i = 1; i <= seedNum; i++) {
    restaurants.push(generateRestaurantData());
  }
  return Promise.all(restaurants);
}

function generateBoroughName() {
  const boroughs = [
    'Manhattan', 'Queens', 'Brooklyn', 'Bronx', 'Staten Island'
  ];
  return boroughs[Math.floor(Math.random() * boroughs.length)];
}

function generateCuisineType() {
  const cuisines = ['Italian', 'Thai', 'Colombian'];
  return cuisines[Math.floor(Math.random() * cuisines.length)];
}

function generateGrades(num) {
  const grades = [];
  for (let i = 0; i < num; i++) {
    grades.push(generateGradeData())
  }
  return grades;
}

// create a new restaurant with three grades
function generateRestaurantData() {
  const date = faker.date.recent();
  return Restaurant.create({
    name: faker.company.companyName(),
    borough: generateBoroughName(),
    cuisine: generateCuisineType(),
    addressBuildingNumber: faker.address.streetAddress(),
    addressStreet: faker.address.streetName(),
    addressZipcode: faker.address.zipCode(),
    createdAt: date,
    updatedAt: date,
    grades: generateGrades(3)
  }, {
    include: [{
      model: Grade,
      as: 'grades'
    }]
  });
}

function generateGradeData() {
  const grades = ['A', 'B', 'C', 'D', 'F'];
  const date = faker.date.recent();
  const grade = grades[Math.floor(Math.random() * grades.length)];
  return {
    inspectionDate: faker.date.past(),
    grade: grade,
    score: 5,
    createdAt: date,
    updatedAt: date,
  };
}



describe('Grade API resource', function () {

  // to make tests quicker, only drop all rows from each
  // table in between tests, instead of recreating tables
  beforeEach(function () {
    return Restaurant
      // .truncate drops all rows in this table
      .truncate({
        cascade: true
      })
      // then seed db with new test data
      .then(() => seedRestaurantData())
  });


  describe('GET endpoint', function () {

    it('should return a single grade by id', function () {
      // strategy:
      //    1. Get a grade from db
      //    2. Prove you can retrieve it by id at `/grades/:id`
      let grade;
      return Grade
        .findOne()
        .then(_grade => {
          grade = _grade;
          return chai.request(app)
            .get(`/grades/${grade.id}`);
        })
        .then(res => {
          res.should.have.status(200);
          res.body.id.should.equal(grade.id);
        })
    });
  });

  describe('POST endpoint', function () {
    // strategy: make a POST request with data,
    // then prove that the grade we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new grade', function () {
      const grades = ['A', 'B', 'C', 'D', 'F'];
      const grade = grades[Math.floor(Math.random() * grades.length)];
      const randNum = Math.floor(Math.random() * 10);
      const newGradeData = {
        restaurant_id: randNum,
        inspectionDate: faker.date.past(),
        grade: grade,
        score: randNum
      };
      return chai.request(app).post('/grades').send(newGradeData)
        .then(function (res) {
          console.log(res);
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'grade', 'score', 'restaurant_id', 'inspectionDate');
          // cause db should have created id on insertion
          res.body.id.should.not.be.null;
          return Grade.findById(res.body.id);
        })
        .then(function (grade) {
          grade.grade.should.equal(newGradeData.grade);
          grade.score.should.equal(newGradeData.score);
        });
    });
  });
  // need to finish this wheen I get back
  describe('PUT endpoint', function () {

    // strategy:
    //  1. Get an existing grade from db
    //  2. Make a PUT request to update that grade
    //  3. Prove grade returned by request contains data we sent
    //  4. Prove grade in db is correctly updated
    it('should update fields you send over', function () {
      const updateData = {
        grade: 'D',
        score: 1
      };

      return Grade
        .findOne()
        .then(function (grade) {
          updateData.id = grade.id;
          // make request then inspect it to make sure it reflects
          // data we sent
          return chai.request(app)
            .put(`/grades/${grade.id}`)
            .send(updateData);
        })
        .then(function (res) {
          res.should.have.status(204);
          return Grade.findById(updateData.id);
        })
        .then(function (grade) {
          grade.grade.should.equal(updateData.grade);
          grade.score.should.equal(updateData.score);
        });
    });
  });

  describe('DELETE endpoint', function () {
    // strategy:
    //  1. get a grade
    //  2. make a DELETE request for that grade's id
    //  3. assert that response has right status code
    //  4. prove that grade with the id doesn't exist in db anymore
    it('delete a grade by id', function () {

      let grade;

      return Grade
        .findOne()
        .then(function (_grade) {
          grade = _grade;
          return chai.request(app).delete(`/grades/${grade.id}`);
        })
        .then(function (res) {
          res.should.have.status(204);
          return Grade.findById(grade.id);
        })
        .then(function (_grade) {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_grade.should.be.null` would raise
          // an error. `should.be.null(_grade)` is how we can
          // make assertions about a null value.
          should.not.exist(_grade);
        });
    });
  });
});