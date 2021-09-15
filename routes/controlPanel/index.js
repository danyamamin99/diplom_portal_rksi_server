const { Router } = require('express');
const profile = require('./profile');
const teachers = require('./teachers');
const admins = require('./admins');
const groups = require('./groups');
const students = require('./students');
const diprucs = require('./diprucs');
const customers = require('./customers');
const diploms = require('./diploms');
const news = require('./news');

const router = Router();

router.use(profile);
router.use(teachers);
router.use(admins);
router.use(groups);
router.use(students);
router.use(diprucs);
router.use(customers);
router.use(diploms);
router.use(news);

module.exports = router;