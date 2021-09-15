const { Router } = require('express');
const registration = require('./registration');
const login = require('./login');
const logout = require('./logout');
const resetPass = require('./resetPass');
const refreshToken = require('./refreshToken');

const router = Router();

router.use(registration);
router.use(login);
router.use(logout);
router.use(resetPass);
router.use(refreshToken);

module.exports = router;