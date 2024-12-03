exports.getAlladmin = async (req, res) => {
    try {
      res.render('admin/index');
    } catch (error) {
      res.status(500).render('error', { error: error.message });
    }
  };  