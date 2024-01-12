class DuplicateEntityException extends Error {
    constructor(logMessage) {
        super(logMessage);
    }
};

export default DuplicateEntityException;