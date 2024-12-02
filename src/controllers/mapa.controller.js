exports.getAllmapa = async (req, res) => {
    try {
      res.render('mapas/index');
    } catch (error) {
      res.status(500).render('error', { error: error.message });
    }
  };  