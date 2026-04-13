const requireFaculty = (req, res, next) => {
  if (req.user.role !== 'faculty') {
    return res.status(403).json({ 
      error: 'Access denied. Faculty role required.' 
    });
  }
  next();
};

const requireStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      error: 'Access denied. Student role required.' 
    });
  }
  next();
};

module.exports = {
  requireFaculty,
  requireStudent
};
