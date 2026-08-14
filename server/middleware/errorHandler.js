const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(400).json({ message: `${err.meta?.target?.[0] || 'Field'} already exists.` });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Record not found.' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error.',
  });
};

module.exports = errorHandler;
