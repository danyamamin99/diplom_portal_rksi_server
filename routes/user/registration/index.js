const { Router } = require('express');
const { Group, Student, DipSupervisor } = require('../../../models/models');
const { validationResult } = require('express-validator');
const { validatorRegistration } = require('../../../middleware/validators');
const { userVerification } = require('../helpers');
const transporter = require('../../../nodemailer');
const bcrypt = require('bcrypt');
const regEmail = require('../../../letters/regEmail');

const router = Router();

router.get('/registration', async (req, res) => {
    try {
        let groups = await Group.findAll(
            {
                attributes: ['id', 'name', 'date_release'],
                where: { isRelease: false }
            }
        );

        if (!groups.length) groups = 'Групп пока нет..'

        res.status(200).json({groups, status: true});
    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
    }
});

router.post('/registration', validatorRegistration, async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array(), status: false});
        }

        const user = req.body;
        let candidate, hashPassword;

        if (!user.policy || typeof(user.policy) !== 'boolean') {
            return res.status(400).json({message: "Согласитесь на обработку персональных данных!", status: false});
        }

        switch (user.role) {
            case 'STUD':
                candidate = await userVerification(Student, user, 'or', 'phone', false);

                if (candidate) {
                    return res.status(400).json({message: "Пользователь найден!", status: false});
                }

                hashPassword = await bcrypt.hash(user.password, 10);
                await Student.create({
                    name: user.name,
                    email: user.email,
                    password: hashPassword,
                    phone: user.phone,
                    groupId: user.group 
                });
                break;

            case 'DIP.RUC':
                candidate = await userVerification(DipSupervisor, user, 'or', 'phone', false);

                if (candidate) {
                    return res.status(400).json({message: "Пользователь найден!", status: false});
                }

                hashPassword = await bcrypt.hash(user.password, 10);
                await DipSupervisor.create({
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    password: hashPassword,
                    company: user.company,
                    post: user.post
                });
                break;
        }

        transporter.sendMail(regEmail(user.email), (err, info) => {
            if (err) return console.log(err);
            console.log('Email sent: ', info);
        });

        res.status(201).json({message: 'Спасибо за регистрация! Сообщение на почте!', status: true});
        
    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так...' + e, status: false});
    }
});

module.exports = router;