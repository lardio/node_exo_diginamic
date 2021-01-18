const { Sequelize, DataTypes } = require('sequelize');
var bcrypt = require("bcryptjs");
const dbConfig = require("../config/db.config");
const studentModel = require("../models/students.model");
const userModel = require("../models/users.model");
const lessonModel = require("../models/lessons.model");
const teacherModel = require("../models/teachers.model");;
const commentModel = require("../models/comments.model");;
const publicationModel = require("../models/publications.model");;

//Recuperation des données pour enrichir la base
const studentListe = require("../config/testing/liste_etudiant");
const userListe = require("../config/testing/liste_users");
const lessonListe = require("../config/testing/liste_lessons");
const teacherListe = require("../config/testing/liste_teacher");
const publiListe = require("../config/testing/liste_publication");
const commentListe = require("../config/testing/liste_comment");

const { getAge } = require("../services/students.services")

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: 'mysql',
  timestamps : false
});

const Student = studentModel(sequelize, DataTypes);
const Lesson = lessonModel(sequelize, DataTypes);
const User = userModel(sequelize, DataTypes);
const Publication = publicationModel(sequelize, DataTypes);
const Teacher = teacherModel(sequelize, DataTypes);
const Comment = commentModel(sequelize, DataTypes);

//Student o-o User
Student.hasOne(User);
User.belongsTo(Student);

//Teacher o-o User
Teacher.hasOne(User);
User.belongsTo(Teacher);

//Student o-m Publication
Student.hasMany(Publication);
Publication.belongsTo(Student);

//Student o-m Comment
Student.hasMany(Comment);
Comment.belongsTo(Student);

//Student m-m Student
Student.belongsToMany(Student, {as: 'Bro', through: 'Amitie', foreignKey: 'broId'});
Student.belongsToMany(Student, {as: 'Bro2', through: 'Amitie', foreignKey: 'bro2Id'});

//Student m-m Lesson
Student.belongsToMany(Lesson, { through: 'LessonStudents', foreignKey: 'studentId'});
Lesson.belongsToMany(Student, { through: 'LessonStudents', foreignKey: 'lessonId'});

//Teacher o-m Publication
Teacher.hasMany(Publication);
Publication.belongsTo(Teacher);

//Teacher o-m Comment
Teacher.hasMany(Comment);
Comment.belongsTo(Teacher);

//Teacher m-m Lesson
Teacher.belongsToMany(Lesson, { through: 'LessonTeacher', foreignKey: 'profId'});
Lesson.belongsToMany(Teacher, { through: 'LessonTeacher', foreignKey: 'courId'});

//Lesson o-m Publi
Publication.hasMany(Comment);
Comment.belongsTo(Publication);

//Lesson o-m Publi
Lesson.hasMany(Publication);
Publication.belongsTo(Lesson);

//{force : true}
const initDb = () => {
  return sequelize.sync()
    .then(_ => {
      console.log("Connection a la BDD a fonctionée");
      //Ajout des données dans la base
      /*
      studentListe.map((etudiant) => { //pour ajouter un minimum de données dans la BDD
        etudiant.age = getAge(etudiant.birthdate);
        Student.create(etudiant);
      });
      userListe.map((user) => { //pour ajouter un minimum de données dans la BDD
          User.create({
            email : user.email,
            password: bcrypt.hashSync(user.password, 8)
          });
      });
      commentListe.map((comment) => { //pour ajouter un minimum de données dans la BDD
        Comment.create(comment);
      });
      publiListe.map((publi) => { //pour ajouter un minimum de données dans la BDD
        Publication.create(publi);
      });
      teacherListe.map((teacher) => { //pour ajouter un minimum de données dans la BDD
        Teacher.create(teacher);
      });
      lessonListe.map((lesson) => { //pour ajouter un minimum de données dans la BDD
        Lesson.create(lesson);
      });
      */
    })
    .catch(error => {
      console.log("Erreur lors de la connexion a la BDD \n" + error);
    })
}

module.exports = {
  initDb, Student, Lesson, User, Teacher, Comment, Publication
};