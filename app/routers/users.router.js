const express = require('express');
const router = express.Router();
const userController = require('../controller/users.controller');
const auth = require('../services/auth.services');

router.put('/login', userController.login);
router.post('/register', userController.register);

//Routes qui necessitent auth
router.put('/me/modify-password', auth, userController.modifyPassword);
router.delete('/me/delete', auth, userController.deleteAccount);
router.get('/me', auth, userController.getInfo);
router.put('/me', auth, userController.changeMyInfo);
router.post('/me', auth, userController.createMyInfo);
router.put('/mail', auth, userController.modifyMail);

module.exports = router;