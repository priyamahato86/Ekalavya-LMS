export const requireEducator = (req, res, next) => {
  if (req.user.role !== 'educator') {
    return res.status(403).json({ message: 'Educator access only' });
  }
  next();
};

//export default requireEducator;
