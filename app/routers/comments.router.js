const express = require('express');
const router = express.Router();
const commentsController = require('../controller/comments.controller');
const auth = require('../services/auth.services');

router.post('/:id', auth, commentsController.addComment);
router.put('/:id', auth, commentsController.modifyComment);
router.delete('/:id', auth, commentsController.deleteComment);
router.get('/:id', auth, commentsController.getById);
router.get('/', auth, commentsController.getAll);

module.exports = router;