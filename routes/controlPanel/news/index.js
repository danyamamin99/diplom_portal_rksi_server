const {Router} = require('express');
const {Admin, Student, Notice, ClassroomTeacher, Group, DipSupervisor, Customer, View, Diplom, News, RefreshToken} = require('../../../models/models');
const checkRoleMiddleware = require('../../../middleware/checkRoleAndAuthMiddleware');

const router = Router();

router.get('/news', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const news = await News.findAll(
      {
        attributes: ['id', 'title', 'text'],
        order: [['updatedAt', 'DESC']]
      });

    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});
    
    res.status(200).json({news, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так..' + e.message, status: false});
  }
});

router.post('/create/news', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const news = await News.create({ title: req.body.title, text: req.body.text });

    res.status(201).json({message: 'Новость успешно создана!', idNews: news.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/edit/news/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const news = await News.findByPk(
        req.params.id,
        {
          attributes: ['id', 'title', 'text']
        }
      );

      if (!news) return res.status(404).json({message: 'Новость не найдена!', status: false});

    res.status(200).json({news, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.put('/edit/news', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const news = await News.findByPk(req.body.id);

    if (!news) return res.status(404).json({message: 'Новость не найдена!', status: false});

    news.title = req.body.title;
    news.text = req.body.text;
    await news.save();

    res.status(200).json({message: 'Новость успешно изменена!', idNews: news.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.delete('/delete/news/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);

    if (!news) return res.status(404).json({message: 'Новость не найдена!', status: false});

    await news.destroy();

    res.status(200).json({message: 'Новость успешно удалена!', idNews: news.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

module.exports = router;