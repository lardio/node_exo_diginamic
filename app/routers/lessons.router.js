const express = require('express');
const router = express.Router();
const lessonController = require('../controller/lessons.controller');
const auth = require('../services/auth.services');

router.get('/', lessonController.getAll);
router.get('/:id', lessonController.getById);
router.post('/', auth, lessonController.create);
router.put('/:id', auth, lessonController.modifyLesson);
router.delete('/:id', auth, lessonController.remove);

module.exports = router;