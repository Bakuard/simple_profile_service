import ms from 'ms';

class AuthService {

    #userService;
    #jwsService;

    constructor(userService, jwsService) {
        this.#userService = userService;
        this.#jwsService = jwsService;
    }

    async registerByMailWithoutConfirmation(cridential) {
        const user = await this.#userService.add(cridential);
        const jws = this.#jwsService.generateJws(user.id, 'common', ms(process.env.JWS_COMMON_LIFETIME_DAYS));
        return { jws, user };
    }

    async enter(cridential) {
        const user = await this.#userService.getByEmail(cridential.email);
        if(!this.#userService.isPaswordValid(user, cridential.password)) {
            throw new BadCredentialException('Incorrect email or password');
        }
        const jws = this.#jwsService.generateJws(user.id, 'common', ms(process.env.JWS_COMMON_LIFETIME_DAYS));
        return { jws, user };
    }
};

export default AuthService;