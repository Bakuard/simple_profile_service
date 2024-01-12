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
        let user = User.createNewUser({
            firstName: 'first-name',
            secondName: 'second-name',
            email: 'me@email.com',
            password: 'some-password',
            sex: 'male',
            photoPath: 'some-path',
            registrationDate: date
        });
        user = await userRepository.add(user);

        const actualUser = await userRepository.findById(user.id);

        expect(actualUser).toMatchObject({
            firstName: 'first-name',
            secondName: 'second-name',
            email: 'me@email.com',
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
        await userRepository.add(User.createNewUser({
            firstName: 'first-name',
            secondName: 'second-name',
            email: 'me@email.com',
            password: 'some-password',
            sex: 'male',
            photoPath: 'some-path',
            registrationDate: date
        }));
        let userWithDuplicateEmail = User.createNewUser({
            firstName: 'other-first-name',
            secondName: 'other-second-name',
            email: 'me@email.com',
            password: 'other-password',
            sex: 'female',
            photoPath: 'other-some-path',
            registrationDate: date
        });
        
        expect(async () => await userRepository.add(userWithDuplicateEmail)).rejects.toThrow(DuplicateEntityException);
    });

test(`userRepository.add(newUser):
        some fields are undefined
        => add user`, 
    async () => {
        const date = new Date();
        let user = User.createNewUser({
            firstName: 'first-name',
            secondName: undefined,
            email: 'me@email.com',
            password: 'some-password',
            sex: undefined,
            photoPath: undefined,
            registrationDate: date
        });
        user = await userRepository.add(user);

        const actualUser = await userRepository.findById(user.id);

        expect(actualUser).toMatchObject({
            firstName: 'first-name',
            secondName: null,
            email: 'me@email.com',
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
        await userRepository.add(User.createNewUser({
            firstName: 'first-name',
            secondName: 'second-name',
            email: 'me@email.com',
            password: 'some-password',
            sex: 'male',
            photoPath: 'some-path',
            registrationDate: date
        }));
        let userWithDuplicateEmail = await userRepository.add(User.createNewUser({
            firstName: 'other-first-name',
            secondName: 'other-second-name',
            email: 'other@email.com',
            password: 'other-password',
            sex: 'female',
            photoPath: 'other-some-path',
            registrationDate: date
        }));

        userWithDuplicateEmail.email = 'me@email.com';
        expect(async () => await userRepository.update(userWithDuplicateEmail)).rejects.toThrow(DuplicateEntityException);
    });

test(`userRepository.update(updatedUser):
        user with such email and other id doesn't exists
        => update user`, 
    async () => {
        const date = new Date();
        await userRepository.add(User.createNewUser({
            firstName: 'first-name',
            secondName: 'second-name',
            email: 'me@email.com',
            password: 'some-password',
            sex: 'male',
            photoPath: 'some-path',
            registrationDate: date
        }));
        let updatedUser = await userRepository.add(User.createNewUser({
            firstName: 'other-first-name',
            secondName: 'other-second-name',
            email: 'other@email.com',
            password: 'other-password',
            sex: 'female',
            photoPath: 'other-some-path',
            registrationDate: date
        }));
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
            sex: 'male',
            photoPath: 'new-photo-path',
            registrationDate: date
        });
    });

test(`userRepository.findByEmail(email):
        there is user with such email
        => return user`,
    async () => {
        const expectedUser = await userRepository.add(User.createNewUser({
            firstName: 'first-name',
            secondName: 'second-name',
            email: 'me@email.com',
            password: 'some-password',
            sex: 'male',
            photoPath: 'some-path',
            registrationDate: new Date()
        }));

        const actualUser = await userRepository.findByEmail('me@email.com');

        expect(actualUser).toEqual(expectedUser);
    });

test(`userRepository.findByEmail(email):
        there is not user with such email
        => return null`,
    async () => {
        await userRepository.add(User.createNewUser({
            firstName: 'first-name',
            secondName: 'second-name',
            email: 'me@email.com',
            password: 'some-password',
            sex: 'male',
            photoPath: 'some-path',
            registrationDate: new Date()
        }));

        const actualUser = await userRepository.findByEmail('unknown@email.com');

        expect(actualUser).toBe(null);
    });

test(`userRepository.findById(id):
        there is not user with such id
        => return null`,
    async () => {
        await userRepository.add(User.createNewUser({
            firstName: 'first-name',
            secondName: 'second-name',
            email: 'me@email.com',
            password: 'some-password',
            sex: 'male',
            photoPath: 'some-path',
            registrationDate: new Date()
        }));

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
        const user1 = await userRepository.add(User.createNewUser({
            firstName: 'first-name1',
            secondName: 'second-name1',
            email: 'me1@email.com',
            password: 'some-1',
            sex: 'male',
            photoPath: 'some-path1',
            registrationDate: date2
        }));
        const user2 = await userRepository.add(User.createNewUser({
            firstName: 'first-name2',
            secondName: 'second-name2',
            email: 'me2@email.com',
            password: 'some-password2',
            sex: 'female',
            photoPath: 'some-path2',
            registrationDate: date1
        }));
        const user3 = await userRepository.add(User.createNewUser({
            firstName: 'first-name3',
            secondName: 'second-name3',
            email: 'me3@email.com',
            password: 'some-password3',
            sex: 'male',
            photoPath: 'some-path3',
            registrationDate: date3
        }));

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