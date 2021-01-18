const express = require('express');
const router = express.Router();
const teacherController = require('../controller/teachers.controller');
const auth = require('../services/auth.services');

router.get('/', auth, teacherController.getAll);
router.get('/:id', auth, teacherController.getById);

module.exports = router;