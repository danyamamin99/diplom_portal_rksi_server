const { Router } = require('express');
const bcrypt = require('bcrypt');
const {Student, Group, ClassroomTeacher, DipSupervisor, Diplom, News, Notice} = require('../../../models/models');
const checkRoleMiddleware = require('../../../middleware/checkRoleAndAuthMiddleware');

const router = Router();

router.get('/profile', checkRoleMiddleware('STUD'), async (req, res) => {
  try {
    const stud = await Student.findByPk(
      req.user.userId,
      {
        attributes: ['name', 'email', 'phone', 'adress'],
        include: [
          {
            model: Group,
            attributes: ['name'],
            include: {
              model: ClassroomTeacher,
              attributes: ['name', 'phone']
            }
          },
          {
            model: DipSupervisor,
            attributes: ['name', 'phone']
          },
          {
            model: Diplom,
            attributes: ['theme']
          }
        ]
      }
    );

    const news = await News.findAll({ order: [['updatedAt', 'DESC']], limit: 3});
    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});

    res.status(200).json({stud, news, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/edit/profile', checkRoleMiddleware('STUD'), async (req, res) => {
  try {
    const stud = await Student.findByPk(
      req.user.userId,
      { 
        attributes: ['email', 'phone', 'adress'],
        include: [{ model: Diplom, attributes: [ 'theme' ]}]         
      }
    );

    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});

    res.status(200).json({stud, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.put('/edit/profile', checkRoleMiddleware('STUD'), async (req, res) => {
  try {
    const stud = await Student.update(
      {
        email: req.body.email,
        phone: req.body.phone,
        adress: req.body.adress 
      },
      { where: { id: req.user.userId }}
    );

    res.status(200).json({message: 'Данные успешно изменены!', status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.put('/edit/profile/password', checkRoleMiddleware('STUD'), async (req, res) => {
  try {
    const {password, newPassword} = req.body;

    const stud = await Student.findOne({ where: { id: req.user.userId }});

    const comparePassword = await bcrypt.compare(password, stud.password);

    if (!comparePassword) return res.status(404).json({message: 'Неверный пароль!', status: false});

    stud.password = await bcrypt.hash(newPassword, 10);
    await stud.save();

    res.status(200).json({message: 'Пароль успешно изменен!', status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

module.exports = router;