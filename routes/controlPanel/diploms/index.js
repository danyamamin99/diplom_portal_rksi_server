const { Router } = require('express');
const { Notice, Customer, View, Diplom } = require('../../../models/models');
const checkRoleMiddleware = require('../../../middleware/checkRoleAndAuthMiddleware');

const router = Router();

router.get('/diploms', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const diploms = await Diplom.findAll({
      attributes: ['id', 'theme', 'description'],
      include: [
        {
          model: View, attributes: ['id', 'name']
        },
        {
          model: Customer, attributes: ['id', 'name']
        }
      ]
    });
    const views = await View.findAll({attributes: ['id', 'name']});
    const customers = await Customer.findAll({attributes: ['id', 'name'], where: { isProcessed: true, isFree: true}});
    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});

    res.status(200).json({diploms, views, customers, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.post('/create/diplom', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const view = await View.findOne({ where: { id: req.body.viewId }});
    if (!view) return res.status(404).json({message: 'Не правильно указали viewId! Повторите еще раз!', status: false});

    const customer = await Customer.findOne({ where: { id: req.body.customerId }});
    if (!customer) return res.status(404).json({message: 'Не правильно указали customerId! Повторите еще раз!', status: false});

    const diplom = await Diplom.create({
      theme: req.body.theme,
      description: req.body.description,
      viewId: req.body.viewId,
      customerId: req.body.customerId
    });

    if (req.body.check) {
      customer.isFree = false;
      await customer.save();
    }

    res.status(201).json({message: 'Тема успешно создана!', idDiplom: diplom.id, idCustomer: customer.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/views', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const views = await View.findAll({attributes: ['id', 'name']});

    const notice = await Notice.findOne({attributes: ['text'], order: [['id', 'DESC']], limit: 1});

    res.status(200).json({views, notice, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/view/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const view = await View.findOne({attributes: ['id', 'name'], where: { id: req.params.id }});

    if (!view) return res.status(404).json({message: 'Произошла ошибка! Попробуйте еще раз!', status: false})

    res.status(200).json({view, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.post('/create/view', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const view = await View.create({ name: req.body.name });

    res.status(201).json({message: 'Вид успешно создан!', idView: view.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.get('/edit/view/:id', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const view = await View.findOne({attributes: ['id', 'name'], where: { id: req.params.id }});

    if (!view) return res.status(404).json({message: 'Произошла ошибка! Попробуйте еще раз!', status: false})

    res.status(201).json({view, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

router.put('/edit/view', checkRoleMiddleware('ADMIN'), async (req, res) => {
  try {
    const view = await View.findOne({where: { id: req.body.id }});

    if (!view) return res.status(404).json({message: 'Произошла ошибка! Попробуйте еще раз!', status: false})

    view.name = req.body.name;
    await view.save();

    res.status(201).json({idView: view.id, status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

module.exports = router;