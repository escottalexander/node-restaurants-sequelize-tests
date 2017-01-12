module.exports = {
    PORT: process.env.PORT || 8080,
    sequelize: {
      development: {
        username: null,
        password: null,
        database: "dev-restaurants-app",
        host: "127.0.0.1",
        dialect: "postgres"
      },
      test: {
        username: null,
        password: null,
        database: "test-restaurants-app",
        host: "127.0.0.1",
        dialect: "postgres"
      },
      production: {
        username: null,
        password: null,
        database: "prod-restaurants-app",
        host: "127.0.0.1",
        dialect: "postgres"
      }
    }

};

