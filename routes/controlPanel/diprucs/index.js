const { Router } = require('express');
const { Op } = require('sequelize');
const { Student, Notice, Group, DipSupervisor } = require('../../../models/models');
const checkRoleMiddleware = require('../../../middleware/checkRoleAndAuthMiddleware');
const transporter = require('../../../nodemailer/index');
const activateUser = require('../../../letters/activateUser');

const router = Router();

router.get('/diprucs', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    let diprucs = await DipSupervisor.findAll(
      {
        attributes: ['id', 'name', 'phone'],
        order: [['status', 'DESC']],
        raw: true
    });

    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});
    
    const studs = await Student.findAll({
      attributes: ['dipSupervisorId'],
      where: { dipSupervisorId: { [Op.not]: null }}
    });

    diprucs.forEach(item => {
      item.count = 0;
      studs.forEach(stud => { if (item.id == stud.dipSupervisorId) item.count++ });
    });

    res.status(200).json({diprucs, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/dipruc/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const dipruc = await DipSupervisor.findOne(
      { 
        attributes: ['name', 'phone', 'email'],
        where: { id: req.params.id }
      }
    );
    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});

    if (!dipruc) return res.status(404).json({message: 'Дипломный руководитель не найден!', notice, status: false});

    const studs = await Student.findAndCountAll(
      { 
        attributes: ['id', 'name'],
        include: [
          {
            model: Group, attributes: ['date_release']
          }
        ],
        where: { dipSupervisorId: req.params.id },
        raw: true
      }
    );

    const groups = await Group.findAll({ attributes: ['date_release'], group: 'date_release', raw: true });

    const listStud = {};

    groups.forEach(group => {
      listStud[group.date_release] = [];
      studs.rows.forEach(stud => {
        if (group.date_release == stud['group.date_release'])
          listStud[group.date_release].push(stud)
      });
    });

    res.status(200).json({dipruc, listStud, count: studs.count, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.put('/activate/dipruc/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const dipruc = await DipSupervisor.findOne({ where: { id: req.params.id }});

    if (!dipruc) return res.status(404).json({message: 'Дипломный руководитель не найден!', status: false});

    dipruc.status = 'active';
    await dipruc.save();

    transporter.sendMail(activateUser(dipruc.email), (err, info) => {
      if (err) return console.log(err);
      console.log('Email sent: ', info);
    });

    res.status(200).json({message: 'Дипломный руководитель активирован!', idDipRuc: dipruc.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/edit/dipruc/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const dipruc = await DipSupervisor.findOne(
      {
        attributes: ['id', 'name', 'email', 'phone'],
        where: { id: req.params.id }
      }
    );

    if (!dipruc) return res.status(404).json({message: 'Дипломный руководитель не найден!', status: false});

    res.status(200).json({dipruc, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.put('/edit/dipruc', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const dipruc = await DipSupervisor.findOne({ where: { id: req.body.id }});

    if (!dipruc) {
      return res.status(404).json({message: 'Произошла ошибка...Повторите еще раз!', status: false}); 
    }

    dipruc.name = req.body.name;
    dipruc.email = req.body.email;
    dipruc.phone = req.body.phone;
    await dipruc.save();

    res.status(200).json({message: 'Дипломный руководитель изменен!', idDipRuc: req.body.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.delete('/delete/dipruc/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const dipruc = await DipSupervisor.findOne({ where: { id: req.params.id }});

    if (!dipruc) return res.status(404).json({message: 'Дипломный руководитель не найден!', status: false});

    const studs = await Student.findAll({ where: { dipSupervisorId: req.params.id }});

    if (studs.length) {
      studs.forEach(async (stud)  => {
        stud.dipSupervisorId = null;
        await stud.save();
      })
    }

    await dipruc.destroy();

    res.status(200).json({message: 'Дипломный руководитель успешно удален!', idDipRuc: req.params.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

module.exports = router;