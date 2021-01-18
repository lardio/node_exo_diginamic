const express = require('express');
const router = express.Router();
const studentController = require('../controller/students.controller');
const auth = require('../services/auth.services');

router.get('/', auth, studentController.getAll);
router.get('/:id', auth, studentController.getById);
router.post('/', auth, studentController.create);
router.post('/friendship/:id', auth, studentController.addPote);
router.delete('/friendship/:id', auth, studentController.removePote);
router.post('/enroll/:id', auth, studentController.addLesson);
router.put('/:id', studentController.update);
//router.delete('/:id',studentController.remove);

module.exports = router;