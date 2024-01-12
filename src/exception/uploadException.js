class UploadException extends Error {
    constructor(logMessage) {
        super(logMessage);
    }
};

export default UploadException;