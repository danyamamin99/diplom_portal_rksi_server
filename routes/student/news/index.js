const { Router } = require('express');
const { News, Notice } = require('../../../models/models');
const checkRoleMiddleware = require('../../../middleware/checkRoleAndAuthMiddleware');

const router = Router();

router.get('/news', checkRoleMiddleware('STUD'), async (req, res) => {
  try {
    const news = await News.findAll({attributes: ['id', 'title', 'text'], order: [['updatedAt', 'DESC']]});
    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});

    res.status(200).json({news, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/news/:id', checkRoleMiddleware('STUD'), async (req, res) => {
  try {
    const news = await News.findOne({attributes: ['id', 'title', 'text'], where: {id: req.params.id}});

    if (!news) return res.status(404).json({message: 'Новость не найдена!', status: false});

    res.status(200).json({news, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

module.exports = router;