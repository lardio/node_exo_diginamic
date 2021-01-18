const express = require('express');
const router = express.Router();
const publicationController = require('../controller/publications.controller');
const auth = require('../services/auth.services');

router.post('/', auth, publicationController.addPublication);
router.put('/:id', auth, publicationController.modifyPublication);
router.delete('/:id', auth, publicationController.deletePublication);
router.get('/:id', auth, publicationController.getById);
router.get('/', auth, publicationController.getAll);

module.exports = router;