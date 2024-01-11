import UnknownEntityException from '../exception/unknownEntity.js';
import User from '../model/user.js';

class UserService {

    #userRepository;
    #validationService;

    constructor(userRepository, validationService) {
        this.#userRepository = userRepository;
        this.#validationService = validationService;
    }

    async add(newUser) {
        this.#validationService.assertNewUserIsValid(newUser);
        let user = User.createNewUser(newUser);
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
        user.update(userData);
        await this.#userRepository.update(user);
        return user;
    }
};

export default UserService; 