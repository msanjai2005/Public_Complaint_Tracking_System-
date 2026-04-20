// Admin role check middleware
const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin/Staff privileges required.',
    });
  }
};

// Strict admin only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
};

module.exports = { admin, adminOnly };
