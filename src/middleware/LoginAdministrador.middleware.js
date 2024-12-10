// middleware/login.middleware.js

const isAuthenticated = (req, res, next) => {
    if (req.session.usuario) {
        // El usuario está autenticado
        next();
    } else {
        // El usuario no está autenticado, redirigir al login
        req.flash('error', 'Debes iniciar sesión para acceder a esta página');
        res.redirect('/admin/login');
    }
};

module.exports = {
    isAuthenticated,
    setUserLocals: (req, res, next) => {
        res.locals.usuario = req.session.usuario;
        next();
    }
};