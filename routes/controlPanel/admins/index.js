const { Router } = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const { Admin, Notice } = require('../../../models/models');
const checkRoleMiddleware = require('../../../middleware/checkRoleAndAuthMiddleware');
const { validatorRegistration } = require('../../../middleware/validators');
const { validationResult } = require('express-validator');

const router = Router();

router.get('/admins', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const admins = await Admin.findAll({attributes: ['id', 'name', 'phone']});
    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});

    res.status(200).json({admins, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});
    
router.post('/create/admin', checkRoleMiddleware('ADMIN'), validatorRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array(), status: false});
    }

    const {name, email, phone, password} = req.body;
    
    const candidate = await Admin.findOne({
      where: { [Op.or] : [ {email}, {phone} ]}
    });

    if (candidate) return res.status(400).json({message: 'Пользователь уже существует!', status: false});

    const hashPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({ name, email, phone, password: hashPassword });

    res.status(201).json({message: 'Пользователь создан.', idAdmin: admin.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.post('/create/superadmin', validatorRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array(), status: false});
    }

    const {name, email, phone, password} = req.body;

    const hashPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({ name, email, phone, password: hashPassword });

    res.status(201).json({message: 'Пользователь создан.', idAdmin: admin.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/admin/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const admin = await Admin.findOne({attributes: ['id', 'name', 'phone'], where: { id: req.params.id }});

    if (!admin) return res.status(404).json({message: 'Пользователь не найден!', status: false});

    res.status(200).json({admin, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

module.exports = router;