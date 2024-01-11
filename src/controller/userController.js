import newLogger from '../conf/logConf.js';

const logger = newLogger('info', 'userController.js', 'AuthServise');

class UserController {

    #userService;

    constructor(userService) {
        this.#userService = userService;
    }

    async enter(req, res, next) {
        logger.info(`user with email '%s' try enter`, req.body.email);
        res.status(200).send('ok');
    }

    async registration(req, res, next) {
        logger.info(`user '%s' try register`, { firstName: req.body.firstName, email: req.body.email });
        res.status(200).send('ok');
    }

    async getById(req, res, next) {
        logger.info(`get user by id=%s`, req.params.id);
        res.status(200).send('ok');
    }

    async update(req, res, next) {
        logger.info(`update user by id=%s with data=%s`, req.params.id, req.body);
        res.status(200).send('ok');
    }
};

export default UserController;