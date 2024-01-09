import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDoc from '../public/swagger.json' assert { type: "json" };
import newLogger from './conf/logConf.js';

const logger = newLogger('info', 'index.js', 'AuthServise');
const app = express();

app.use(express.json());
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.listen(8080, () => logger.info('Server was started successfully.'));


function wrapAsync(callback) {
    return function(req, res, next) {
        return callback(req, res, next).catch(err => next(err));
    }
}