const { Router } = require('express');
const { RefreshToken } = require('../../../models/models');
const { verifyRefreshToken } = require('../helpers');

const router = Router();

router.post('/logout', verifyRefreshToken,  async (req, res) => {
    await RefreshToken.destroy({ where: { idUser: req.user.userId, roleUser: req.user.role }});
    res.status(200).json({status: true, message: "Вышли из системы..."})
});

module.exports = router;