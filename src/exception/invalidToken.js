class InvalidTokenException extends Error {
    constructor(logMessage) {
        super(logMessage);
    }
};

export default InvalidTokenException;