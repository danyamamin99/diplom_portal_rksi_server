const jwt = require('jsonwebtoken');
const config = require('config');
const {Op} = require("sequelize");
const { RefreshToken } = require('../../models/models');

const createJWT = (id, role, secret_key, time) => {
    return jwt.sign(
        {
        userId: id,
        role: role,
        },
        secret_key,
        { expiresIn: time }
    )
};

const generateRefreshToken = async (id, role) => {
    const refreshToken = createJWT(id, role, config.get('JWT_REFRESH_SECRET'), '7d');

    const storedRefreshToken = await RefreshToken.findOne({ where: { idUser: id, roleUser: role }});
    
    if (!storedRefreshToken) {
        await RefreshToken.create({
            idUser: id, roleUser: role, refreshToken
        });
    } else {
        storedRefreshToken.refreshToken = refreshToken;
        await storedRefreshToken.save();
    }

    return refreshToken;
};

const verifyRefreshToken = async (req, res, next) => {
    try {
        const token = req.body.token;
    
        if (!token)
            return res.status(401).json({message: 'Неверный запрос!', status: false});

        const decoded = jwt.verify(token, config.get('JWT_REFRESH_SECRET'));
        req.user = decoded;
        
        const storedRefreshToken = await RefreshToken.findOne({ where: { idUser: decoded.userId, roleUser: decoded.role }});

        if (!storedRefreshToken)
            return res.status(401).json({message: 'Неверный запрос! Токена нет в хранилище!', status: false});

        if (storedRefreshToken.refreshToken !== token)
            return res.status(401).json({message: 'Неверный запрос! Нужен другой токен!', status: false});

        next();
    } catch (e) {
        res.status(401).json({message: 'Плохо сформированный токен... ' +  e.message, status: false} );
    }
};

const userVerification = async (Model, user, op = '', prop = '', isValue = true, value = 'active') => {
    if (prop == '' && op == '') {
        return candidate = await Model.findOne({
                where: {email: user.email}
        });
    } else {
        return candidate = await Model.findOne({
                where: {
                    [Op[op]]: [
                        {email: user.email},
                        {[prop]: isValue ? value : user[prop]}
                    ]}});
    }
};

const userVerificationToken = async (Model, token) => {
    return candidate = await Model.findOne({
        where: {
            token,
            tokenLife: { [Op.gt]: Date.now() } 
        }});
};

const userChangePass = async (Model, id, token) => {
    return candidate = await Model.findOne({
        where: {
            id, token, tokenLife: { [Op.gt]: Date.now() }
        }
    });
};

module.exports = {
    createJWT,
    generateRefreshToken,
    verifyRefreshToken,
    userVerification,
    userVerificationToken,
    userChangePass
};