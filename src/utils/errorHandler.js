// utils/errorHandler.js

class ErrorHandler extends Error {
    constructor(message, statusCode) {
      // Call the constructor of the parent Error class
      super(message);
  
      // Assign the status code and a status string
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
  
      // Mark that this is an operational error (one we created on purpose)
      this.isOperational = true;
  
      // Capture the stack trace, excluding the constructor call from it
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export default ErrorHandler;