import express from 'express';
import https from 'https';
import swaggerUi from 'swagger-ui-express';
import swaggerDoc from '../public/swagger.json' assert { type: "json" };
import newLogger from './conf/logConf.js';
import ConnectionPool from './repository/connectionPool.js';
import UserRepository from './repository/userRepository.js';
import UserController from './controller/userController.js';

const logger = newLogger('info', 'index.js', 'AuthServise');
const connectionPool = new ConnectionPool();
const userRepository = new UserRepository(connectionPool);
const userController = new UserController();
const app = express();
const httpsServer = https.createServer(app);

connectionPool.initPool()
    .then(() => connectionPool.initSchema())
    .then(() => {
        app.use(express.json());
        app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
        app.post('/user/register', wrapAsync(userController.registration, userController));
        app.post('/user/loggin', wrapAsync(userController.enter, userController));
        app.get('/profile/:id', wrapAsync(userController.getById, userController));
        app.put('/profile/:id', wrapAsync(userController.update, userController));
        app.listen(8080, () => logger.info('Server was started successfully.'));
    });

process.on('SIGINT', () => {
    logger.info('SIGINT signal was received.');
    httpsServer.close(() => {
        logger.info('http server has closed.');
        process.exit(0);
    });
});

function wrapAsync(callback, context) {
    callback = callback.bind(context);
    return function(req, res, next) {
        return callback(req, res, next).catch(err => next(err));
    }
}