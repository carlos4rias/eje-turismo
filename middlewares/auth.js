function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}


function isRoot(req, res, next) {
  if (req.user.local.role === 'root') return next();
  res.redirect('/');
}

function isAdmin(req, res, next) {
  if (req.user.local.role === 'admin') return next();
  res.redirect('/');
}

function isSuscriber(req, res, next) {
  if (req.user.local.role === 'suscriber') return next();
  res.redirect('/');
}

module.exports = {
  isLoggedIn,
  isRoot,
  isAdmin,
  isSuscriber
}
