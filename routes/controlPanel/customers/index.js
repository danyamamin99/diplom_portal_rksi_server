const { Router } = require('express');
const { Customer } = require('../../../models/models');
const checkRoleMiddleware = require('../../../middleware/checkRoleAndAuthMiddleware');

const router = Router();

router.get('/order', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const orders = await Customer.findAll({attributes: ['id', 'name', 'phone', 'description'], where: { isProcessed: false }});

    res.status(200).json({orders, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.put('/processed/order/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const order = await Customer.findOne({ where: { isProcessed: false, id: req.params.id }});

    if (!order) return res.status(404).json({message: 'Заявка не найдена!', status: false});

    order.isProcessed = true;
    await order.save();

    res.status(200).json({message: 'Заявка успешно обработана!', idOrder: order.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.delete('/delete/order/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const order = await Customer.findOne({ where: {id: req.params.id, isProcessed: false }});

    if (!order) return res.status(404).json({message: 'Заявка не найдена!', status: false});

    await order.destroy();

    res.status(200).json({message: 'Заявка успешно удалена!', idOrder: order.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

module.exports = router;