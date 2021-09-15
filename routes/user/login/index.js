const { Router } = require('express');
const config = require('config');
const { Admin, Student, DipSupervisor } = require('../../../models/models');
const { validationResult } = require('express-validator');
const { validatorLogin } = require('../../../middleware/validators');
const { userVerification, createJWT, generateRefreshToken } = require('../helpers');
const bcrypt = require('bcrypt');

const router = Router();

router.post('/login', validatorLogin, async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array(), status: false});
        }

        const user = req.body;
        let candidate;
        
        candidate = await userVerification(Student, user, 'and', 'status');
        if (!candidate) candidate = await userVerification(DipSupervisor, user, 'and', 'status');
        if (!candidate) candidate = await userVerification(Admin, user);
        if (!candidate) {
            return res.status(404).json({message: 'Ошибка...пользователь не найдет либо не активирован!', status: false});
        }

        const comparePassword = await bcrypt.compare(user.password, candidate.password);

        if (!comparePassword) {
            return res.status(401).json({message: 'Введен неверный пароль!'});
        }

        const access_token = createJWT(candidate.id, candidate.role, config.get('JWT_ACCESS_SECRET'), '3h');
        const refresh_token = await generateRefreshToken(candidate.id, candidate.role);

        res.status(200).json({access_token, refresh_token, role: candidate.role, status: true});
    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так...' + e, status: false});
    }
});

module.exports = router;