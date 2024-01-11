import User from '../model/user.js';
import PageMeta from './pageMeta.js';
import DuplicateEntity from '../exception/duplicateEntity.js';

class UserRepository {

    #connectionManager;

    constructor(connectionManager) {
        this.#connectionManager = connectionManager;
    }

    async add(newUser) {
        return await this.#connectionManager.transaction(
            async (connection) => {
                const rows = await connection.query(
                    `INSERT INTO users(firstName, secondName, email, passwordHash, salt, sex, photoPath, registrationDate)
                        VALUES(?, ?, ?, ?, ?, ?, ?, ?);`,
                    [newUser.firstName, newUser.secondName, newUser.email, newUser.passwordHash, newUser.salt, 
                        newUser.hasMaleSex(), newUser.photoPath, newUser.registrationDate]
                );
                newUser.id = rows[0].insertId;
                return newUser;
            },
            err => {
                if(err.code == 'ER_DUP_ENTRY') return new DuplicateEntity(`User with email ${newUser.email} alredy exists`);
                else return new Error('Internal error', { cause: err })
            }
        );
    }

    async update(updatedUser) {
        await this.#connectionManager.transaction(
            async (connection) => {
                await connection.query(
                    `UPDATE users SET firstName=?, secondName=?, email=?, sex=?, photoPath=?, registrationDate=? WHERE id=?;`,
                    [updatedUser.firstName, updatedUser.secondName, updatedUser.email, updatedUser.hasMaleSex(), 
                        updatedUser.photoPath, updatedUser.registrationDate, updatedUser.id]
                );
            },
            err => {
                if(err.code == 'ER_DUP_ENTRY') return new DuplicateEntity(`User with email ${updatedUser.email} alredy exists`);
                else return new Error('Internal error', { cause: err })
            }
        );
    }

    async findById(userId) {
        const rows = await this.#connectionManager.getPool().query(
            `SELECT * FROM users WHERE id=?;`,
            [userId]
        );
        return this.#mapRowToUser(rows[0][0]);
    }

    async findByEmail(email) {
        const rows = await this.#connectionManager.getPool().query(
            `SELECT * FROM users WHERE email=?;`,
            [email]
        );
        return this.#mapRowToUser(rows[0][0]);
    }

    async findAll(pageNumber, pageSize) {
        const connection = await this.#connectionManager.getPool().getConnection();

        const totalItems = await connection.query(`SELECT COUNT(*) AS result FROM users;`);
        const pageMeta = new PageMeta(pageSize, pageNumber, totalItems[0][0].result);
        const rows = await connection.query(
            `SELECT * FROM users ORDER BY registrationDate, id LIMIT ? OFFSET ?;`,
            [pageMeta.pageSize, pageMeta.offset()]
        );
        const resultUsers = rows[0].map(row => this.#mapRowToUser(row));
        connection.release();

        return { meta: pageMeta, data: resultUsers };
    }


    #mapRowToUser(row) {
        return row ? 
            new User(
                row.id,
                row.firstName,
                row.secondName,
                row.email,
                row.passwordHash,
                row.salt,
                row.sex == true ? 'male' : 'female',
                row.photoPath,
                row.registrationDate
            ) : 
            null;
    }
};

export default UserRepository;