import BadCredentialException from '../exception/badCredential.js';
import UnknownEntityException from '../exception/unknownEntity.js';
import User from '../model/user.js';

class UserService {

    #userRepository;
    #validationService;

    constructor(userRepository, validationService) {
        this.#userRepository = userRepository;
        this.#validationService = validationService;
    }

    async enter(cridential) {
        const user = await this.#userRepository.findByEmail(cridential.email);
        if(!user?.isPaswordValid(cridential.password)) {
            throw new BadCredentialException('Incorrect email or password');
        }
        return user;
    }

    async register(cridential) {
        this.#validationService.assertNewUserIsValid(cridential);
        let user = User.createNewUser(cridential);
        user = await this.#userRepository.add(user);
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