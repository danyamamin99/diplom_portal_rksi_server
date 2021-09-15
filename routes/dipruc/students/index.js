const { Router } = require('express');
const { Notice, Student, Group, Diplom } = require('../../../models/models');
const checkRoleMiddleware = require('../../../middleware/checkRoleAndAuthMiddleware');

const router = Router();

router.get('/students', checkRoleMiddleware('DIP.RUC'), async (req, res) => {
  try {
    const dateRelease = await Group.findAll({ attributes: ['date_release'], group: 'date_release' });
    const students = await Student.findAll({
      where: { dipSupervisorId: req.user.userId },
      attributes: ['id', 'name'],
      include: [
        {
          model: Group,
          attributes: ['date_release']
        }
      ],
      raw: true
    });

    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});
    
    let list = {};
    dateRelease.forEach(date => {
      list[date.date_release] = [];
      students.forEach(item => {
        if (item['group.date_release'] == date.date_release) list[date.date_release].push(item);
      });
    });
  
    res.status(200).json({list, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/student/:id', checkRoleMiddleware('DIP.RUC'), async (req, res) => {
  try {
    const student = await Student.findOne({
      attributes: ['id', 'name'],
      include: [
        { model: Group,  attributes: ['id', 'name', 'date_release'] },
        { model: Diplom, attributes: ['id', 'theme'] }
      ],
      where: { id: req.params.id }
    });

    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});

    if (!student) return res.status(404).json({message: 'Студент не найден!', notice, status: false})

    res.status(200).json({student, notice, status: true})
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

module.exports = router;