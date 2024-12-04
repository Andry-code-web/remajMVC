exports.getContacto = async (req, res) => {
    try {
        res.render('layouts/contacto', {
            content: 'contact/index'
        })
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};