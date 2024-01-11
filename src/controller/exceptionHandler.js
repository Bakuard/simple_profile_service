import BadCredentialException from '../exception/badCredential.js';
import UnknownEntityException from '../exception/unknownEntity.js';
import DuplicateEntityException from '../exception/duplicateEntity.js';
import ValidationException from '../exception/validationException.js';
import InvalidTokenException from '../exception/invalidToken.js';
import UploadException from '../exception/uploadException.js';
import newLogger from '../conf/logConf.js';

const logger = newLogger('error', 'exceptionHandler.js', 'AuthServise');

class ExceptionHandler {

    #dtoMapper;

    constructor(dtoMapper) {
        this.#dtoMapper = dtoMapper;
    }

    handle(err, req, res, next) {
        logger.error('message: %s; stack: %s; cause: %s', err.message, err.stack, err.cause);
        if(err instanceof BadCredentialException || err instanceof InvalidTokenException) {
            res.status(403).send(this.#dtoMapper.toErrorResponse(err));
        } else if(err instanceof UnknownEntityException) {
            res.status(404).send(this.#dtoMapper.toErrorResponse(err));
        } else if(err instanceof DuplicateEntityException || err instanceof ValidationException) {
            res.status(400).send(this.#dtoMapper.toErrorResponse(err));
        } else if(err instanceof UploadException) {
            res.status(413).send(this.#dtoMapper.toErrorResponse(err));
        } else {
            if(err?.statusCode == 404) {
                res.status(404).send(this.#dtoMapper.toErrorResponse(err));
            } else {
                res.status(500).send(this.#dtoMapper.toErrorResponse(err));
            }
        }
    }
}

export default ExceptionHandler;