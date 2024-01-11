class UnknownEntityException extends Error {
    constructor(logMessage) {
        super(logMessage);
    }
};

export default UnknownEntityException;