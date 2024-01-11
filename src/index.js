import express from 'express';
import https from 'https';
import swaggerUi from 'swagger-ui-express';
import swaggerDoc from '../public/swagger.json' assert { type: "json" };
import newLogger from './conf/logConf.js';
import ConnectionManager from './repository/connectionManager.js';
import UserRepository from './repository/userRepository.js';
import ValidationService from './service/validationService.js';
import UserService from './service/userService.js';
import JwsService from './service/jwsService.js';
import AuthService from './service/authService.js';
import DtoMapper from './dto/dtoMapper.js';
import UserController from './controller/userController.js';
import ExceptionHandler from './controller/exceptionHandler.js';

const logger = newLogger('info', 'index.js', 'AuthServise');
const connectionManager = new ConnectionManager();
const userRepository = new UserRepository(connectionManager);
const validationService = new ValidationService();
const userService = new UserService(userRepository, validationService);
const jwsService = new JwsService();
const authService = new AuthService(userService, jwsService);
const dtoMapper = new DtoMapper();
const userController = new UserController(userService, authService, dtoMapper);
const exceptionHandler = new ExceptionHandler(dtoMapper);

const app = express();
const httpsServer = https.createServer(app);
app.use(express.json());
app.use(express.urlencoded());
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.post('/user/register', wrapAsync(userController.registration, userController));
app.post('/user/loggin', wrapAsync(userController.enter, userController));
app.use(checkJws);
app.get('/profile/:id', wrapAsync(userController.getById, userController));
app.put('/profile/:id', wrapAsync(userController.update, userController));
app.get('/profiles', wrapAsync(userController.getAll, userController));
app.use(exceptionHandler.handle.bind(exceptionHandler));
app.set('json replacer', (key, value) => typeof(value) === "undefined" ? null : value);

connectionManager.initPool()
    .then(() => connectionManager.initSchema())
    .then(() => app.listen(8080, () => logger.info('Server was started successfully.')));

process.on('SIGINT', () => {
    logger.info('SIGINT signal was received.');
    httpsServer.close(async () => {
        logger.info('http server has closed.');
        await connectionManager.close().catch(err => logger.error(err));
        logger.info('database connections have closed.');
        process.exit(0);
    });
});


function checkJws(req, res, next) {
    req.userIdFromJws = jwsService.parseJws(req.headers.authorization, 'common');
    next();
}

function wrapAsync(callback, context) {
    callback = callback.bind(context);
    return function(req, res, next) {
        return callback(req, res, next).catch(err => next(err));
    }
}