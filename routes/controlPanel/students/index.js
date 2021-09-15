const { Router } = require('express');
const { Student, Notice, ClassroomTeacher, Group, DipSupervisor, Diplom } = require('../../../models/models');
const checkRoleMiddleware = require('../../../middleware/checkRoleAndAuthMiddleware');
const transporter = require('../../../nodemailer/index');
const activateUser = require('../../../letters/activateUser');

const router = Router();

router.get('/students', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    let studs = await Student.findAll(
      {
        attributes: ['id', 'name', 'status'],
        include: [{ model: Group, attributes: ['id', 'name'] }],
        order: [['status', 'DESC']] 
      });

    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});

    res.status(200).json({studs, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/student/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const stud = await Student.findByPk(
      req.params.id,
      {
        attributes: ['name', 'phone', 'email'],
        include: [ 
          { model:  DipSupervisor, attributes: ['name', 'phone'] }, 
          { 
            model:  Group, 
            attributes: ['name', 'date_release'],
            include: [{ model: ClassroomTeacher, attributes: ['name', 'phone'] }]
          },
          { model:  Diplom, attributes: ['theme'] }
        ]
      }
    );

    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});

    if (!stud) return res.status(404).json({message: 'Студент не найден!', notice, status: false});

    res.status(200).json({stud, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.put('/activate/student/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const stud = await Student.findByPk(req.params.id);

    if (!stud) return res.status(404).json({message: 'Студент не найден!', status: false});

    stud.status = 'active';
    await stud.save();

    transporter.sendMail(activateUser(stud.email), (err, info) => {
      if (err) return console.log(err);
      console.log('Email sent: ', info);
    });

    res.status(200).json({message: 'Студент активирован!', idStud: stud.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/edit/student/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const stud = await Student.findByPk(
      req.params.id,
      {
        attributes: ['id', 'name', 'email'],
        include: [ 
          { model:  DipSupervisor, attributes: ['id', 'name'] }, 
          { model:  Group, attributes: ['id', 'name'] }  
        ]
      }
    );

    if (!stud) return res.status(404).json({message: 'Студент не найден!', status: false})

    const diprucs = await DipSupervisor.findAll({attributes: ['id', 'name']});
    const groups = await Group.findAll({attributes: ['id', 'name'], where: { isRelease: false }});

    res.status(200).json({ stud, diprucs, groups, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.put('/edit/student', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const stud = await Student.update(
      {
        email: req.body.email,
        dipSupervisorId: req.body.idDipRuc,
        groupId: req.body.idGroup
      },
      { where: { id: req.body.id } }
    );

    if (!stud['0']) {
      return res.status(404).json({message: 'Студент не найден!', status: false}); 
    }

    res.status(200).json({message: 'Студент изменен!', idStud: req.body.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.delete('/delete/student/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const stud = await Student.findOne({where: {id: req.params.id}});

    if (!stud) return res.status(404).json({message: 'Студент не найден!', status: false});

    if (stud.diplomId) {
      const diplom = await Diplom.findOne({where: {id: stud.diplomId}});
      
      if (!diplom) return res.status(404).json({message: 'Произошла ошибка...Повторите еще раз!!', status: false});
      
      if (diplom.customerId) { 
        diplom.isFree = true;
        await diplom.save();
      } else {
        await diplom.destroy();
      }
    }

    await stud.destroy();

    res.status(200).json({message: 'Студент успешно удален!', idStud: stud.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

module.exports = router;