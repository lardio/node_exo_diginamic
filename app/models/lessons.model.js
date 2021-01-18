module.exports = (sequelize, Sequelize) => {
  const Lesson = sequelize.define("lesson", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: Sequelize.STRING
    },
    hours: {
      type: Sequelize.INTEGER
    },
    description: {
      type: Sequelize.TEXT
    },
    is_finished: {
      type : Sequelize.BOOLEAN
    },
    file_name: {
      type : Sequelize.STRING
    },
    starting_date: {
      type:Sequelize.DATE
    },
    ending_date: {
      type:Sequelize.DATE
    }
  },  
  {
    timestamps: false,
  });
  return Lesson;
};