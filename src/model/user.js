import crypto from 'crypto';

class User {

    static createNewUser(firstName, secondName, email, password, sex, photoPath, registrationData) {
        let salt = crypto.randomBytes(16).toString('hex');
        let passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');

        return new User(firstName, secondName, email, passwordHash, salt, sex, photoPath, registrationData);
    }

    constructor(id, firstName, secondName, email, passwordHash, salt, sex, photoPath, registrationData) {
        this.id = id;
        this.firstName = firstName;
        this.secondName = secondName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.salt = salt;
        this.sex = sex;
        this.photoPath = photoPath;
        this.registrationData = registrationData;
    }

    isPaswordValid(password) {
        return crypto.scryptSync(password, this.salt, 64).toString('hex') === this.passwordHash;
    }
};

export default User;