module.exports = (sequelize, Sequelize) => {
    const Comment = sequelize.define("comment", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      creation_date: {
        type: Sequelize.DATE
      },
      body_text: {
        type: Sequelize.TEXT
      }
    },  
    {
      timestamps: false,
    });
    return Comment;
};