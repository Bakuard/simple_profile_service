import BadCredentialException from '../exception/badCredential.js';
import UnknownEntityException from '../exception/unknownEntity.js';
import DuplicateEntityException from '../exception/duplicateEntity.js';
import newLogger from '../conf/logConf.js';

const logger = newLogger('error', 'exceptionHandler.js', 'AuthServise');

class ExceptionHandler {

    #dtoMapper;

    constructor(dtoMapper) {
        this.#dtoMapper = dtoMapper;
    }

    handle(err, req, res, next) {
        logger.error(err);
        if(err instanceof BadCredentialException) {
            res.status(403).send(this.#dtoMapper.toErrorResponse(err));
        } else if(err instanceof UnknownEntityException) {
            res.status(404).send(this.#dtoMapper.toErrorResponse(err));
        } else if(err instanceof DuplicateEntityException) {
            res.status(400).send(this.#dtoMapper.toErrorResponse(err));
        } else {
            res.status(500).send(this.#dtoMapper.toErrorResponse(err));
        }
    }
}

export default ExceptionHandler;