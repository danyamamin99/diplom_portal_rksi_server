const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') next();

  const token = req.body.token;

  if (token === null)
    return res.status(401).json({message: 'Неверный запрос!', status: false});

  // try {
    const decoded = jwt.verify(token, config.get('JWT_REFRESH_SECRET'));
    console.log(token);
    req.user = decoded;

    let storedRefreshToken = refreshTokens.find(x => x.id === decoded.id && x.role === decoded.role);
    if (storedRefreshToken === undefined)
      return res.status(401).json({message: 'Неверный запрос! Токена нет в хранилище!', status: false});

    next();
  // } catch (e) {
  //   res.status(401).json({message: 'Не авторизован!!', status: false} );
  // }
};