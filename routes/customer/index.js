const { Router } = require('express');
const { validationResult } = require('express-validator');
const { Customer } = require('../../models/models');
const { validatorCustomer } = require('../../middleware/validators');

const router = Router();

router.post('/order', validatorCustomer, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({errors: errors.array(), status: false});

    const {name, phone, description, policy} = req.body;

    if (!policy || typeof(policy) !== 'boolean') {
      return res.status(400).json({message: "Согласитесь на обработку персональных данных!", status: false});
    }

    await Customer.create({name, phone, description});

    res.status(201).json({message: 'Спасибо! Заявка была отправлена! С Вами свяжутся!', status: true});
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
  }
});

module.exports = router;