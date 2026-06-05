const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // superadmin inherits all admin permissions
    const effectiveRole = req.user.role === 'superadmin' ? 'superadmin' : req.user.role;
    const allowed = roles.includes(effectiveRole) ||
      (roles.includes('admin') && effectiveRole === 'superadmin');
    if (!allowed) {
      return res.status(403).json({ message: `Role '${req.user.role}' is not authorized` });
    }
    next();
  };
};

module.exports = { authorizeRoles };