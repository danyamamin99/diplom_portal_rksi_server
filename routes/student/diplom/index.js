const { Router } = require('express');
const { Student, DipSupervisor, Diplom, View, Notice } = require('../../../models/models');
const checkRoleMiddleware = require('../../../middleware/checkRoleAndAuthMiddleware');

const router = Router(); 

router.get('/quiz/view', checkRoleMiddleware('STUD'), async (req, res) => {
  try {
    const name = await Student.findByPk(req.user.userId, {attributes: ['name']});
    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});
    const views = await View.findAll({attributes: ['id', 'name']});

    res.status(200).json({name, notice, views, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/quiz/themes', checkRoleMiddleware('STUD'), async (req, res) => {
  try {
    const themes = await Diplom.findAll({
      attributes: ['id', 'theme', 'description'],
      include: [
        {
          model: View,
          attributes: ['id', 'name']
        }
      ],
      where: { isFree: true } 
    });
    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});

    res.status(200).json({themes, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/quiz/dipruc', checkRoleMiddleware('STUD'), async (req, res) => {
  try {
    const dipruc = await DipSupervisor.findAll({ attributes: ['id', 'name'], where: { status: 'active' }});
    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});

    res.status(200).json({dipruc, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.post('/quiz/end', checkRoleMiddleware('STUD'), async (req, res) => {
  try {
    const quiz = req.body;
    const stud = await Student.findOne({where: {id: req.user.userId}});
    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});

    if (quiz.idTheme) {
      const diplom = await Diplom.findOne({where: {id: quiz.idTheme}});
      
      diplom.isFree = false;
      stud.dipSupervisorId = quiz.dipRuc;
      stud.diplomId = quiz.idTheme;

      await stud.save();
      await diplom.save();
      res.status(200).json({message: 'Все прошло успешно! Тема была выбрана!', notice, theme: diplom.theme, status: true});
    } else {
      const diplom = await Diplom.create({
        theme: quiz.theme,
        viewId: quiz.viewId,
        isFree: false
      });

      stud.dipSupervisorId = quiz.dipRuc;
      stud.diplomId = diplom.id;
      await stud.save();
      res.status(201).json({message: 'Все прошло успешно! Тема была создана!', notice, theme: diplom.theme, status: false});
    }
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/diplom', checkRoleMiddleware('STUD'), async (req, res) => {
  try {
    const diplom = await Student.findByPk(req.user.userId, {
      attributes: ['diplomId'],
      include: [
        {
          model: Diplom,
          attributes: ['theme']
        }
      ]
    });
    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});
  
    res.status(200).json({diplom, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

module.exports = router;