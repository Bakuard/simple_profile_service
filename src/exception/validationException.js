class ValidationException extends Error {
    constructor(logMessage) {
        super(logMessage);
    }
};

export default ValidationException;