const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

const handleError = (res, message, statusCode = 500) => {
    res.status(statusCode).json({ error: message });
};

const formatResponse = (data, message = 'Success') => {
    return {
        status: 'success',
        message,
        data,
    };
};

export { validateEmail, handleError, formatResponse };