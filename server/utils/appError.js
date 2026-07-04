class AppError extends Error {
  constructor(message, statusCode, field = null) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.field = field;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
