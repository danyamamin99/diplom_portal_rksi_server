const { Router } = require('express');

const userRouter = require('./user');
const customerRouter = require('./customer');
const studentRouter = require('./student');
const diprucRouter = require('./dipruc');
const controlPanelRouter = require('./controlPanel');

const router = Router();

router.use('/user', userRouter);
router.use('/student', studentRouter);
router.use('/dipruc', diprucRouter);
router.use('/controlPanel', controlPanelRouter);
router.use('/customer', customerRouter);

module.exports = router;