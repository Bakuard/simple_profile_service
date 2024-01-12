import newLogger from '../conf/logConf.js';

const logger = newLogger('info', 'userController.js', 'AuthServise');

class UserController {

    #userService;
    #authService;
    #dtoMapper;

    constructor(userService, authService, dtoMapper) {
        this.#userService = userService;
        this.#authService = authService;
        this.#dtoMapper = dtoMapper;
    }

    async enter(req, res, next) {
        logger.info(`user with email '%s' try enter`, req.body.email);
        const userWithJws = await this.#authService.enter(req.body);
        const userWithJwsResponse = this.#dtoMapper.toJwsResponse(userWithJws);
        res.status(200).send(userWithJwsResponse);
    }

    async registration(req, res, next) {
        logger.info(`user '%s' try register`, { firstName: req.body.firstName, email: req.body.email });
        const userWithJws = await this.#authService.registerByMailWithoutConfirmation(req.body);
        const userWithJwsResponse = this.#dtoMapper.toJwsResponse(userWithJws);
        res.status(200).send(userWithJwsResponse);
    }

    async getById(req, res, next) {
        logger.info(`get user by id=s%`, req.params.id);
        const user = await this.#userService.getById(req.params.id);
        const userResponse = this.#dtoMapper.toUserResponse(user);
        res.status(200).send(userResponse);
    }

    async getAll(req, res, next) {
        logger.info(`get all users with pageNumber=s%`, req.query.page);
        const page = await this.#userService.getAll(req.query.page);
        const pageResponse = this.#dtoMapper.toUsersResponse(page);
        res.status(200).send(pageResponse);
    }

    async update(req, res, next) {
        logger.info(`update user by id=%s with data=%s`, req.params.id, req.body);
        const user = await this.#userService.update(req.params.id, req.body);
        const userResponse = this.#dtoMapper.toUserResponse(user);
        res.status(200).send(userResponse);
    }
};

export default UserController;