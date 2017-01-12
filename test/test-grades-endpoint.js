const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const app = require('../app');
const {Grade} = require('../models');

chai.use(chaiHttp);

function generateGradeData() {
  const grades = ['A', 'B', 'C', 'D', 'F'];
  const date = faker.date.recent();
  const grade = grades[Math.floor(Math.random() * grades.length)];
  return {
    inspectionDate: faker.date.past(),
    grade: grade,
    createdAt: date,
    updatedAt: date,
  };
}

function seedGradeData(seedNum=1) {
  const grades = [];
  for (let i=1; i<=seedNum; i++) {
    grades.push(Grade.create(generateGradeData()));
  }
  return Promise.all(grades);
}


describe('Grades API resource', function() {


  // to make tests quicker, only drop all rows from each
  // table in between tests, instead of recreating tables
  beforeEach(function() {
    return Grade
      .truncate({cascade: true})
      .then(() => seedGradeData());
  });


  describe('GET endpoint', function() {

    it('should return a single grade', function() {
      // strategy:
      //    1. Get a grade from db
      //    2. Prove you can retrieve it by id at `/grades/:id`
      let grade;
      return Grade
        .findOne()
        .then(_grade => {
          grade = _grade
          return chai.request(app)
            .get(`/grades/${grade.id}`);
        })
        .then(res => {
          res.should.have.status(200);
          res.body.should.include.keys(
              'id', 'grade', 'score', 'inspectionDate');
          res.body.id.should.equal(grade.id);
          res.body.grade.should.equal(grade.grade);
        })
    });
  });
});

