module.exports = (sequelize, Sequelize) => {
  const Student = sequelize.define("student", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: Sequelize.STRING
    },
    last_name: {
      type: Sequelize.STRING
    },
    bio: {
      type: Sequelize.TEXT
    },
    birthdate: {
      type:Sequelize.DATE
    },
    level: {
      type:Sequelize.INTEGER
    },
    profile_picture: {
      type:Sequelize.TEXT
    }
  },
  {
    timestamps: false,
  });
  return Student;
};