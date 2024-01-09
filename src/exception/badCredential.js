class BadCredentialException extends Error {
    constructor(logMessage) {
        super(logMessage);
    }
};

export default BadCredentialException;