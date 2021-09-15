const { Router } = require('express');
const { verifyRefreshToken, createJWT, generateRefreshToken } = require('../helpers');
const config = require('config');

const router = Router();

router.post('/token', verifyRefreshToken, async (req, res) => {
    const candidate = req.user;
    const access_token = createJWT(candidate.userId, candidate.role, config.get('JWT_ACCESS_SECRET'), '3h');
    const refresh_token = await generateRefreshToken(candidate.userId, candidate.role);
    res.status(200).json({access_token, refresh_token, status: true});
});

module.exports = router;