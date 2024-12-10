exports.getAllAdminGeneral = (req, res) => {
  try {
    res.render('admingeneral/index');
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
};