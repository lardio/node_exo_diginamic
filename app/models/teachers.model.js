module.exports = (sequelize, Sequelize) => {
    const Teacher = sequelize.define("teacher", {
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
      subject: {
        type:Sequelize.TEXT
      },
      profile_picture: {
        type:Sequelize.TEXT
      }
    },  
    {
      timestamps: false,
    });
    return Teacher;
  };