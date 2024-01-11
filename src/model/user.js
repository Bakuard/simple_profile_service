import crypto from 'crypto';

class User {

    static createNewUser({firstName, secondName, email, password, sex, photoPath, registrationDate}) {
        let salt = crypto.randomBytes(16).toString('hex');
        let passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');

        return new User(null, firstName, secondName, email, passwordHash, salt, sex, photoPath, registrationDate ?? new Date());
    }

    constructor(id, firstName, secondName, email, passwordHash, salt, sex, photoPath, registrationDate) {
        this.id = id;
        this.firstName = firstName;
        this.secondName = secondName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.salt = salt;
        this.sex = sex ?? 'male';
        this.photoPath = photoPath;
        this.registrationDate = registrationDate;
    }

    isPaswordValid(password) {
        return password && crypto.scryptSync(password, this.salt, 64).toString('hex') === this.passwordHash;
    }

    hasMaleSex() {
        return 'male' === this.sex;
    }

    update({firstName, secondName, email, sex, photoPath}) {
        this.firstName = firstName;
        this.secondName = secondName;
        this.email = email;
        this.sex = sex;
        this.photoPath = photoPath;
    }
};

export default User;