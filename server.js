
const express = require('express');
const bodyParser = require('body-parser');

const students = require('./app/routers/students.router.js');
const lessons = require('./app/routers/lessons.router');
const users = require('./app/routers/users.router');
const teachers = require('./app/routers/teachers.router');
const publications = require('./app/routers/publications.router');
const comments = require('./app/routers/comments.router');

const db = require('./app/models/db')

const app = express();
app.use(bodyParser.json())

app.use('/students', students);
app.use('/lessons', lessons);
app.use('/', users);
app.use('/teachers', teachers);
app.use('/publications', publications);
app.use('/comments', comments);

db.initDb();

app.listen(3000);