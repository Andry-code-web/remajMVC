const jwt = require('jsonwebtoken');

exports.isAuthenticated = (req, res, next) => {
  // Check session
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }

  // Check JWT token in cookies
  const token = req.cookies.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
      req.session.user = decoded; // Store in session for future requests
      return next();
    } catch (err) {
      console.error('JWT verification failed:', err);
    }
  }

  return res.status(401).json({ 
    success: false, 
    message: 'Usuario no autorizado' 
  });
};

exports.setUserLocals = (req, res, next) => {
  // Check session first
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
    return next();
  }

  // Then check JWT
  const token = req.cookies.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      res.locals.user = decoded;
      req.session.user = decoded;
    } catch (err) {
      console.error('JWT verification failed:', err);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  
  next();
};