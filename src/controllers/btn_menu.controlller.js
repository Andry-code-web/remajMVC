exports.getAllbtn_menu = async (req, res) => {
    try {
      res.render('btn_menu/index');
    } catch (error) {
      res.status(500).render('error', { error: error.message });
    }
  };