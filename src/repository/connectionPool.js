import mysql from 'mysql2/promise';
import newLogger from '../conf/logConf.js';

const logger = newLogger('info', 'connectionPool.js', 'AuthServise');

class ConnectionPool {

    #pool;

    constructor() {}

    async initPool() {
        logger.info('Creating connection pool.');

        this.#pool = mysql.createPool({
            connectionLimit: 10,
            password: process.env.DB_USER_PASSWORD,
            user: process.env.DB_USER_NAME,
            database: process.env.DB_NAME,
            host: 'localhost',
            port: process.env.MY_SQL_PORT
        });
    }

    async initSchema() {
        logger.info(`Creating schema for database '%s'`, process.env.DB_NAME);
        await this.transaction(async connection => {
            await connection.query(
                `CREATE TABLE IF NOT EXISTS users(
                    id INT NOT NULL AUTO_INCREMENT,
                    firstName VARCHAR(30) NOT NULL,
                    secondName VARCHAR(30),
                    email VARCHAR(60) NOT NULL,
                    passwordHash VARCHAR(512) NOT NULL,
                    salt VARCHAR(32) NOT NULL,
                    sex BOOL,
                    photoPath VARCHAR(512),
                    registrationDate DATETIME(6) NOT NULL,
                    PRIMARY KEY(id),
                    UNIQUE(email)
                );`
            );
        });
    }

    getPool() {
        return this.#pool;
    }

    async transaction(callback, exceptionFabric) {
        const connection = await this.#pool.getConnection();

        try {
            await connection.beginTransaction();
            const result = await callback(connection);
            await connection.commit();
            return result;
        } catch(err) {
            await connection.rollback();
            throw exceptionFabric(err);
        } finally {
            connection.release();
        }
    }

    async close() {
        logger.info(`Closing connection with database '%s'`, process.env.DB_NAME);
        await this.#pool.end();
    }
}

export default ConnectionPool;