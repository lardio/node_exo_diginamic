module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: Sequelize.STRING,
      unique : {
        msg : "Cet email est déjà pris !"
      }
    },
    password: {
      type: Sequelize.STRING
    },
    type: {
      type : Sequelize.INTEGER
    }
  },  
  {
    timestamps: false,
  });
  return User;
};