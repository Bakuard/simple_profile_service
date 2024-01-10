class DuplicateEntity extends Error {
    constructor(logMessage) {
        super(logMessage);
    }
};

export default DuplicateEntity;