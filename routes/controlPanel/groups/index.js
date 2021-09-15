const { Router } = require('express');
const { Student, Notice, ClassroomTeacher, Group } = require('../../../models/models');
const checkRoleMiddleware = require('../../../middleware/checkRoleAndAuthMiddleware');

const router = Router();

router.get('/groups', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    let groups = await Group.findAll({
      attributes: ['id', 'name', 'date_release'],
      include: [
        {
          model: ClassroomTeacher,
          attributes: ['id', 'name']
        }
      ],
      order: [['date_release', 'DESC']],
    });

    let teachers = await ClassroomTeacher.findAll({ 
      attributes: ['id', 'name'],
      where: {isGroup: false},
      order: [['name']]
    });

    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});

    res.status(200).json({groups, teachers, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.post('/create/group', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const teacher = await ClassroomTeacher.findOne({ where: { id: req.body.idTeacher, isGroup: false }});

    if (!teacher) return res.status(404).json({message: 'Преподователя такого нет!', status: false});

    const group = await Group.create({
      name: req.body.name,
      date_release: req.body.date,
      classroomTeacherId: req.body.idTeacher
    });
    
    teacher.isGroup = true;
    await teacher.save();

    res.status(201).json({message: 'Группа успешно создана!', idGroup: group.id, idTeacher: teacher.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/group/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const group = await Group.findByPk(
      req.params.id,
      {
        attributes: ['name'],
        include: [ { model:  ClassroomTeacher, attributes: ['name'] } ]
      }
    );
    
    const students = await Student.findAndCountAll({
      attributes: ['id', 'name', 'phone'], 
      where: { groupId: req.params.id, status: 'active' } 
    });

    res.status(200).json({group, students, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message});
  }
});

router.get('/edit/group/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const group = await Group.findByPk(
      req.params.id, 
      {
        attributes: ['id', 'name', 'date_release'],
        include: [
          { model: ClassroomTeacher, attributes: ['id', 'name'] }
        ]
      }
    );

    let teachers = await ClassroomTeacher.findAll({ where: { isGroup: false } });
    
    if (!Object.keys(teachers).length) teachers = 'Преподователи все заняты..'

    res.status(200).json({group, teachers, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.put('/edit/group', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const group = await Group.findOne({ where: {id: req.body.idGroup}});

    if (!group)
      return res.status(404).json({message: 'Группы не найдено!', status: false});

    if (group.classroomTeacherId == req.body.idTeacher) {
      group.name = req.body.name;
      group.date_release = req.body.date;

      await group.save();
    } else {
      await ClassroomTeacher.update(
        { isGroup: false },
        { where: { id: group.classroomTeacherId }}
      );
      await ClassroomTeacher.update(
        { isGroup: true },
        { where: { id: req.body.idTeacher }}
      );

      group.name = req.body.name;
      group.date_release = req.body.date;
      group.classroomTeacherId = req.body.idTeacher;

      await group.save();
    }
    
    res.status(200).json({message: 'Группа изменена!', idGroup: group.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message});
  }
});

router.put('/release/group/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const group = await Group.findOne({where: {id: req.params.id}});

    if (!group) {
      return res.status(404).json({message: 'Группы не найдено!', status: false}); 
    }

    const teacher = await ClassroomTeacher.update({ isGroup: false }, { where: {id: group.classroomTeacherId}});

    group.isRelease = true;
    await group.save();

    res.status(200).json({message: 'Группа выпустилась!', idGroup: group.id, idTeacher: teacher.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.delete('/delete/group/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);

    if (!group) return res.status(404).json({message: 'Группы не найдено!', status: false}); 

    await ClassroomTeacher.update(
      { isGroup: false },
      { where: { id: group.classroomTeacherId } }
    );

    await group.destroy();

    res.status(200).json({message: 'Группа успешно удалена!', idGroup: group.id, idTeacher: group.classroomTeacherId,  status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

module.exports = router;