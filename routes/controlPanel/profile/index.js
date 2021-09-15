const { Router } = require('express');
const bcrypt = require('bcrypt');
const { Admin, Student, Notice, Group } = require('../../../models/models');
const checkRoleMiddleware = require('../../../middleware/checkRoleAndAuthMiddleware');

const router = Router();

router.get('/profile', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const user = await Admin.findByPk(
      req.user.userId,
      { attributes: ['name'] }
    );

    const allStuds = await Student.count();
    const yearStuds = await Student.count({ include: [ { model: Group, where: { isRelease: false }}]})
    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});

    res.status(200).json({user, allStuds, yearStuds, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.post('/profile/notice', checkRoleMiddleware('ADMIN'),  async (req, res) => {
  try {
    const notice = await Notice.create({ text: req.body.text });

    res.status(201).json({ message: "Уведомление успешно создано!", notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/edit/profile', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const admin = await Admin.findOne(
      { 
        attributes: ['name', 'email', 'phone'],
        where: { id: req.user.userId }
      }
    );

    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});

    res.status(200).json({admin, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.put('/edit/profile', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const admin = await Admin.update(
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone
      },
      { where: { id: req.user.userId }}
    );

    res.status(200).json({message: 'Данные успешно изменены.', status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.put('/edit/profile/password', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const {password, newPassword} = req.body;

    const admin = await Admin.findOne({ where: { id: req.user.userId }});

    const comparePassword = await bcrypt.compare(password, admin.password);

    if (!comparePassword) return res.status(404).json({message: 'Неверный пароль!', status: false});

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.status(200).json({message: 'Пароль успешно изменен!', status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

module.exports = router;