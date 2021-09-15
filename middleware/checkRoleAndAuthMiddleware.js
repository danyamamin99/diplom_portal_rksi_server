const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = role => {
  return function (req, res, next) {

    if (req.method === 'OPTIONS') next();

    try {
      const token = req.headers.authorization.split(' ')[1]; // 'Bearer token'

      if (!token) {
        return res.status(401).json({message: 'Не авторизован!'});
      }

      const decoded = jwt.verify(token, config.get('JWT_ACCESS_SECRET'));

      if (decoded.role !== role) {
        return res.status(403).json({message: 'Нет доступа!'});
      }

      req.user = decoded;
      next();
    } catch (e) {
      res.status(401).json({message: 'Не авторизован!!! ' + e.message});
    }
  }
};