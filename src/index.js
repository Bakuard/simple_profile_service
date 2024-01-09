import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDoc from '../public/swagger.json' assert { type: "json" };
import newLogger from './conf/logConf.js';
import UserController from './controller/userController.js';

const logger = newLogger('info', 'index.js', 'AuthServise');
const userController = new UserController();
const app = express();

app.use(express.json());
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.post('/user/register', wrapAsync(userController.registration, userController));
app.post('/user/loggin', wrapAsync(userController.enter, userController));
app.get('/profile/:id', wrapAsync(userController.getById, userController));
app.put('/profile/:id', wrapAsync(userController.update, userController));
app.listen(8080, () => logger.info('Server was started successfully.'));


function wrapAsync(callback, context) {
    callback = callback.bind(context);
    return function(req, res, next) {
        return callback(req, res, next).catch(err => next(err));
    }
}