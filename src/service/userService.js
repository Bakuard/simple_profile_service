import UnknownEntityException from '../exception/unknownEntity.js';
import User from '../model/user.js';
import crypto from 'crypto';

class UserService {

    #userRepository;
    #validationService;

    constructor(userRepository, validationService) {
        this.#userRepository = userRepository;
        this.#validationService = validationService;
    }

    async add(newUser) {
        this.#validationService.assertNewUserIsValid(newUser);
        let user = this.createNewUser(newUser);
        user = await this.#userRepository.add(user);
        return user;
    }

    async getByEmail(email) {
        const user = await this.#userRepository.findByEmail(email);
        if(!user) {
            throw new UnknownEntityException(`Unknown user with email=${email}`);
        }
        return user;
    }

    async getById(userId) {
        const user = await this.#userRepository.findById(userId);
        if(!user) {
            throw new UnknownEntityException(`Unknown user with id=${userId}`);
        }
        return user;
    }

    async getAll(pageNumber) {
        return await this.#userRepository.findAll(pageNumber, 10);
    }

    async update(userId, userData) {
        this.#validationService.assertUpdatedUserIsValid(userData);
        let user = await this.getById(userId);
        this.updateUser(user, userData);
        await this.#userRepository.update(user);
        return user;
    }

    createNewUser({firstName, secondName, email, password, sex, photoPath, registrationDate}) {
        let salt = crypto.randomBytes(16).toString('hex');
        let passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');

        return new User(null, firstName, secondName, email, passwordHash, salt, sex, photoPath, registrationDate ?? new Date());
    }

    isPaswordValid(user, password) {
        return password && crypto.scryptSync(password, user.salt, 64).toString('hex') === user.passwordHash;
    }

    updateUser(user, {firstName, secondName, email, sex, photoPath}) {
        user.firstName = firstName;
        user.secondName = secondName;
        user.email = email;
        user.sex = sex;
        user.photoPath = photoPath;
    }
};

export default UserService; 