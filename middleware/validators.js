const {body} = require('express-validator/check');

exports.validatorCustomer = [
  body('name', 'Диапазон пароля от 8 до 15 символов!')
    .trim()
    .isLength({min: 5}),
  body('phone', 'Введите номер телефона в формате +7(___)___-__-__')
    // .isMobilePhone()
    .matches(/\+7\(\d{3}\)\d{3}-\d{2}-\d{2}/), // (/\+7|8\(\d{3}\)-\d{3}-\d{2}-\d{2}/)
  body('description', 'Опишите заявку!')
    .trim()
    .isLength({min: 10})
];

exports.validatorRegistration = [
  body('name', 'Слишком короткое имя')
    .trim()
    .isLength({min: 5}),
  body('phone', 'Введите номер телефона в формате +7(___)___-__-__')
    // .isMobilePhone()
    .matches(/\+7\(\d{3}\)\d{3}-\d{2}-\d{2}/), // (/\+7|8\(\d{3}\)-\d{3}-\d{2}-\d{2}/)
  body('password', 'Диапазон пароля от 8 до 15 символов!')
    .trim()
    .isLength({min: 8, max: 15}),
  body('email', 'Введите корректный email')
    .trim()
    .isEmail()
];

exports.validatorLogin = [
  body('password', 'Диапазон пароля от 8 до 15 символов!')
    .trim()
    .isLength({min: 8, max: 15}),
  body('email', 'Введите корректный email')
    .trim()
    .isEmail()
];

exports.validatorResetPassword = [
  body('password', 'Диапазон пароля от 8 до 15 символов!')
    .trim()
    .isLength({min: 8, max: 15})
];