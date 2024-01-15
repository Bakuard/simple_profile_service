import crypto from 'crypto';

class User {

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

    hasMaleSex() {
        return 'male' === this.sex;
    }
};

export default User;