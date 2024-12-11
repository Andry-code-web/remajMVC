const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.redirect('/admin/login');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie('auth_token');
    return res.redirect('/admin/login');
  }
};

const setUserLocals = (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.user = decoded;
    } else {
      res.locals.user = null;
    }
  } catch (error) {
    res.locals.user = null;
  }
  next();
};

module.exports = {
  isAuthenticated,
  setUserLocals
};
