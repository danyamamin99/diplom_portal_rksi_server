const { Router } = require('express');
const crypto =  require('crypto');
const { userVerification, userVerificationToken, userChangePass } = require('../helpers');
const { Admin, Student, DipSupervisor } = require('../../../models/models');
const transporter = require('../../../nodemailer');
const resetPass = require('../../../letters/resetPass');
const { validatorResetPassword } = require('../../../middleware/validators');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const router = Router();

router.post('/reset', (req, res) => {
    crypto.randomBytes(30, async (err, buf) => {
        if (err) {
            return res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
        }
        
        try {
            let candidate;
        
            candidate = await userVerification(Student, req.body, 'and', 'status');
            if (!candidate) candidate = await userVerification(DipSupervisor, req.body, 'and', 'status');
            if (!candidate) candidate = await userVerification(Admin, req.body);
            if (!candidate) {
                return res.status(404).json({message: 'Ошибка...пользователь не найдет либо не активирован!', status: false});
            }

            candidate.token = buf.toString('hex');
            candidate.tokenLife = Date.now() + (1000 * 60 * 25);

            await candidate.save();

            transporter.sendMail(resetPass(candidate.email, candidate.token));

            res.status(200).json({message: 'Перейдите по ссылке на почте!', status: true});
        }  catch (e) {
            res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
        }
        
    });
});

router.get('/password/:token', async (req, res) => {
    try {
        let candidate;
        
        candidate = await userVerificationToken(Student, req.params.token);
        if (!candidate) candidate = await userVerificationToken(DipSupervisor, req.params.token);
        if (!candidate) candidate = await userVerificationToken(Admin, req.params.token);
        if (!candidate) {
            return res.status(400).json({message: 'Ошибка...Жизнь токена исчезла...', status: false});
        }
        
        res.status(200).json({id: candidate.id, token: req.params.token, status: true});
    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
    }
});

router.post('/password', validatorResetPassword, async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty) {
            return res.status(422).json({errors: errors.array()});
        }

        let candidate;
        
        candidate = await userChangePass(Student, req.body.id, req.body.token);
        if (!candidate) candidate = await userChangePass(DipSupervisor, req.body.id, req.body.token);
        if (!candidate) candidate = await userChangePass(Admin, rereq.body.id, req.body.token);
        if (!candidate) {
            return res.status(404).json({message: 'Ошибка...Пользователь не найден!', status: false});
        }

        const comparePassword = await bcrypt.compare(req.body.password, candidate.password);

        if (comparePassword) {
            return res.status(400).json({message: 'Пароли совпадают! Введите другой пароль!', status: false});
        }

        const hashPassword = await bcrypt.hash(req.body.password, 10);

        candidate.password = hashPassword;
        candidate.token = null;
        candidate.tokenLife = null;

        await candidate.save();
        res.status(200).json({message: 'Пароль изменен!', status: true});
    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так...' + e.message, status: false});
    }
});

module.exports = router;