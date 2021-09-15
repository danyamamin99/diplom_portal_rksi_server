const { Router } = require('express');
const { Notice, ClassroomTeacher } = require('../../../models/models');
const checkRoleMiddleware = require('../../../middleware/checkRoleAndAuthMiddleware');

const router = Router();

router.get('/classroomteachers', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const teachers = await ClassroomTeacher.findAll({attributes: { exclude: ['createdAt', 'updatedAt'] }});
    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});
    
    res.status(200).json({teachers, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.post('/create/classroomteacher', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const {name, phone} = req.body;

    const teacher = await ClassroomTeacher.create({ name, phone });

    res.status(201).json({message: 'Преподаватель успешно создан!', idTeacher: teacher.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/edit/classroomteachers/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const teacher = await ClassroomTeacher.findByPk(
      req.params.id,
      { attributes: ['id', 'name', 'phone'] });

    if (!teacher) { return res.status(404).json({message: 'Пользователь не найден!', status: false}); }

    res.status(200).json({teacher, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.put('/edit/classroomteacher', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const teacher = await ClassroomTeacher.findOne({ where: { id: req.body.id }});

    if (!teacher) {
      return res.status(404).json({message: 'Пользователь не найден!', status: false}); 
    }

    teacher.name = req.body.name;
    teacher.phone = req.body.phone;
    await teacher.save();

    res.status(200).json({message: 'Данные преподователя изменены!', idTeacher: teacher.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

module.exports = router;