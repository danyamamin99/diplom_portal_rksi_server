const { Router } = require('express');
const bcrypt = require('bcrypt');
const { DipSupervisor, Student, News, Notice } = require('../../../models/models');
const checkRoleMiddleware = require('../../../middleware/checkRoleAndAuthMiddleware');

const router = Router();

router.get('/profile', checkRoleMiddleware('DIP.RUC'), async (req, res) => {
  try {
    const dipruc = await DipSupervisor.findByPk(
      req.user.userId,
      { attributes: [ 'id', 'name', 'email', 'phone'] }
    );

    const count = await Student.count({
      where: { dipSupervisorId: req.user.userId }
    })

    const news = await News.findAll({attributes: ['id', 'title', 'text'], order: [['updatedAt', 'DESC']], limit: 3});
    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});

    res.status(200).json({dipruc, count, news, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/edit/profile', checkRoleMiddleware('DIP.RUC'), async (req, res) => {
  try {
    const dipruc = await DipSupervisor.findByPk(
      req.user.userId,
      { attributes: ['email', 'phone', 'company', 'post'] }
    );

    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});

    res.status(200).json({dipruc, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.put('/edit/profile', checkRoleMiddleware('DIP.RUC'), async (req, res) => {
  try {
    const dipruc = await DipSupervisor.update(
      {
        email: req.body.email,
        phone: req.body.phone,
        company: req.body.company,
        post: req.body.post 
      },
      { where: { id: req.user.userId }}
    );

    res.status(200).json({message: 'Данные успешно изменены!', status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.put('/edit/profile/password', checkRoleMiddleware('DIP.RUC'), async (req, res) => {
  try {
    const {password, newPassword} = req.body;

    const dipruc = await DipSupervisor.findOne({ where: { id: req.user.userId }});

    const comparePassword = await bcrypt.compare(password, dipruc.password);

    if (!comparePassword) return res.status(404).json({message: 'Неверный пароль!', status: false});

    dipruc.password = await bcrypt.hash(newPassword, 10);
    await dipruc.save();

    res.status(200).json({message: 'Пароль успешно изменен!', status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

module.exports = router;