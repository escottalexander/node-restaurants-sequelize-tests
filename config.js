const env = process.env.NODE_ENV || 'development'

const DATABASE_URL = (
  process.env.DATABASE_URL ||
  global.DATABASE_URL ||
  'postgres://localhost/dev-restaurants-app'
);

const TEST_DATABASE_URL = (
  process.env.TEST_DATABASE_URL ||
  global.TEST_DATABASE_URL ||
  'postgres://localhost/test-restaurants-app');

module.exports = {
    PORT: process.env.PORT || 8080,
    DATABASE_URL: env === 'test' ? TEST_DATABASE_URL : DATABASE_URL,
    SEQUELIZE_OPTIONS: {}
};

