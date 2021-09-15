const { Router } = require('express');
const profile = require('./profile');
const diplom = require('./diplom');
const news = require('./news');

const router = Router();

router.use(profile);
router.use(diplom);
router.use(news);

module.exports = router;