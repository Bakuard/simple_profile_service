import {jest} from '@jest/globals';
import UserRepository from '../../src/repository/userRepository.js';
import ConnectionManager from '../../src/repository/connectionManager.js';
import User from '../../src/model/user.js';
import DuplicateEntityException from '../../src/exception/duplicateEntity.js'; 

let conectionManager = null;
let userRepository = null;

beforeAll(async () => {
    conectionManager = new ConnectionManager();
    userRepository = new UserRepository(conectionManager);
    await conectionManager.initPool();
});

beforeEach(async () => {
    await conectionManager.initSchema();
});

afterEach(async () => {
    await conectionManager.transaction(async connection => await connection.query(`DROP TABLE IF EXISTS users;`));
});

afterAll(async () => {
    await conectionManager.close();
});

test(`userRepository.add(newUser):
       user with such email doesn't exists
       => add user`, 
    async () => {
        const date = new Date();
        let user = new User(
            null,
            'first-name',
            'second-name',
            'me@email.com',
            'some-password-hash',
            'some-salt',
            'male',
            'some-path',
            date
        );
        user = await userRepository.add(user);

        const actualUser = await userRepository.findById(user.id);

        expect(actualUser).toMatchObject({
            firstName: 'first-name',
            secondName: 'second-name',
            email: 'me@email.com',
            passwordHash: 'some-password-hash',
            salt: 'some-salt',
            sex: 'male',
            photoPath: 'some-path',
            registrationDate: date
        });
    });

test(`userRepository.add(newUser):
        user with such email exists
        => exception`, 
    async () => {
        const date = new Date();
        await userRepository.add(new User(
            null,
            'first-name',
            'second-name',
            'me@email.com',
            'some-password-hash',
            'some-salt',
            'male',
            'some-path',
            date
        ));
        let userWithDuplicateEmail = new User(
            null,
            'other-first-name',
            'other-second-name',
            'me@email.com',
            'other-password-hash',
            'other-salt',
            'female',
            'other-some-path',
            date
        );
        
        expect(async () => await userRepository.add(userWithDuplicateEmail)).rejects.toThrow(DuplicateEntityException);
    });

test(`userRepository.add(newUser):
        some fields are undefined
        => add user`, 
    async () => {
        const date = new Date();
        let user = new User(
            null,
            'first-name',
            undefined,
            'me@email.com',
            'some-password-hash',
            'some-salt',
            undefined,
            undefined,
            date
        );
        user = await userRepository.add(user);

        const actualUser = await userRepository.findById(user.id);

        expect(actualUser).toMatchObject({
            firstName: 'first-name',
            secondName: null,
            email: 'me@email.com',
            passwordHash: 'some-password-hash',
            salt: 'some-salt',
            sex: 'male',
            photoPath: null,
            registrationDate: date
        });
    });

test(`userRepository.update(updatedUser):
        user with such email and other id alredy exists
        => exception`, 
    async () => {
        const date = new Date();
        await userRepository.add(new User(
            null,
            'first-name',
            'second-name',
            'me@email.com',
            'some-password-hash',
            'some-salt',
            'male',
            'some-path',
            date
        ));
        let userWithDuplicateEmail = await userRepository.add(new User(
            null,
            'other-first-name',
            'other-second-name',
            'other@email.com',
            'other-password-hash',
            'other-salt',
            'female',
            'other-some-path',
            date
        ));

        userWithDuplicateEmail.email = 'me@email.com';
        expect(async () => await userRepository.update(userWithDuplicateEmail)).rejects.toThrow(DuplicateEntityException);
    });

test(`userRepository.update(updatedUser):
        user with such email and other id doesn't exists
        => update user`, 
    async () => {
        const date = new Date();
        await userRepository.add(new User(
            null,
            'first-name',
            'second-name',
            'me@email.com',
            'some-password-hash',
            'some-salt',
            'male',
            'some-path',
            date
        ));
        let updatedUser = await userRepository.add(new User(
            null,
            'other-first-name',
            'other-second-name',
            'other@email.com',
            'other-password-hash',
            'other-salt',
            'female',
            'other-some-path',
            date
        ));
        updatedUser.firstName = 'new-first-name';
        updatedUser.secondName = 'new-second-name';
        updatedUser.email = 'new-email@mail.com';
        updatedUser.sex = 'male';
        updatedUser.photoPath = 'new-photo-path';

        await userRepository.update(updatedUser);
        const actualUser = await userRepository.findById(updatedUser.id);

        expect(actualUser).toMatchObject({
            firstName: 'new-first-name',
            secondName: 'new-second-name',
            email: 'new-email@mail.com',
            passwordHash: 'other-password-hash',
            salt: 'other-salt',
            sex: 'male',
            photoPath: 'new-photo-path',
            registrationDate: date
        });
    });

test(`userRepository.findByEmail(email):
        there is user with such email
        => return user`,
    async () => {
        const expectedUser = await userRepository.add(new User(
            null,
            'first-name',
            'second-name',
            'me@email.com',
            'some-password-hash',
            'some-salt',
            'male',
            'some-path',
            new Date()
        ));

        const actualUser = await userRepository.findByEmail('me@email.com');

        expect(actualUser).toEqual(expectedUser);
    });

test(`userRepository.findByEmail(email):
        there is not user with such email
        => return null`,
    async () => {
        await userRepository.add(new User(
            null,
            'first-name',
            'second-name',
            'me@email.com',
            'some-password-hash',
            'some-salt',
            'male',
            'some-path',
            new Date()
        ));

        const actualUser = await userRepository.findByEmail('unknown@email.com');

        expect(actualUser).toBe(null);
    });

test(`userRepository.findById(id):
        there is not user with such id
        => return null`,
    async () => {
        await userRepository.add(new User(
            null,
            'first-name',
            'second-name',
            'me@email.com',
            'some-password-hash',
            'some-salt',
            'male',
            'some-path',
            new Date()
        ));

        const actualUser = await userRepository.findById(1000);

        expect(actualUser).toBe(null);
    });

test(`userRepository.findAll(pageNumber, pageSize):
        there are users in db,
        pageNumber = 0,
        pageSize > total users number
        => return correct page`,
    async () => {
        const date1 = new Date('2022-01-01T00:00:00.000Z');
        const date2 = new Date('2022-01-02T00:00:00.000Z');
        const date3 = new Date('2022-01-03T00:00:00.000Z');
        const user1 = await userRepository.add(new User(
            null,
            'first-name1',
            'second-name1',
            'me1@email.com',
            'some-password-hash1',
            'some-salt1',
            'male',
            'some-path1',
            date2
        ));
        const user2 = await userRepository.add(new User(
            null,
            'first-name2',
            'second-name2',
            'me2@email.com',
            'some-password-hash2',
            'some-salt2',
            'female',
            'some-path2',
            date1
        ));
        const user3 = await userRepository.add(new User(
            null,
            'first-name3',
            'second-name3',
            'me3@email.com',
            'some-password-hash3',
            'some-salt3',
            'male',
            'some-path3',
            date3
        ));

        const actualPage = await userRepository.findAll(0, 10);

        expect(actualPage.data).toStrictEqual([user2, user1, user3]);
    });

test(`userRepository.findAll(pageNumber, pageSize):
        there are not users in db,
        pageNumber = 0,
        pageSize > total users number
        => return empty page`,
    async () => {
        const actualPage = await userRepository.findAll(0, 10);

        expect(actualPage.data).toHaveLength(0);
    });