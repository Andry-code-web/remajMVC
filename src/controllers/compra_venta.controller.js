exports.getAllcomprar = async (req, res) => {
    try {
        res.render('layouts/compra_venta',{
            content:'comprar/index'
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};

exports.getAllvender = async (req, res) => {
    try {
        res.render('layouts/compra_venta',{
            content:'vender/index'
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};  