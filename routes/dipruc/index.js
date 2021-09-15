const { Router } = require('express');
const profile = require('./profile');
const students = require('./students');
const news = require('./news');

const router = Router();

router.use(profile);
router.use(students);
router.use(news);

module.exports = router;