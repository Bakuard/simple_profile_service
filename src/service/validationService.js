import Joi from "joi";
import ValidationException from "../exception/validationException.js";

class ValidationService {

    #updatedUserSchema;
    #newUserSchema;

    constructor() {
        this.#newUserSchema = Joi.object({
            firstName: Joi.string().trim().min(2).max(30).required().messages({
                'string.min': 'User first name must contains at least 2 non whitespace character.',
                'string.max': 'User first name can not contains more than 30 character.',
                'string.empty': 'User first name can not be empty.',
                'any.required': 'User first name must be assign.'
            }),
            email: Joi.string().trim().max(50).email().required().messages({
                'string.email': 'Incorrect email format.',
                'string.max': 'email length can not be more than 50 characters.',
                'string.empty': 'email can not be empty.',
                'any.required': 'email must be assign.'
            }),
            password: Joi.string().trim().min(8).max(60).required().messages({
                'string.min': 'password length can not be less than 8 characters.',
                'string.max': 'password length can not be more than 60 characters.',
                'string.empty': 'password can not be empty.',
                'any.required': 'password must be assign.'
            })
        });

        this.#updatedUserSchema = Joi.object({
            firstName: Joi.string().trim().min(2).max(30).required().messages({
                'string.min': 'User first name must contains at least 2 non whitespace character.',
                'string.max': 'User first name can not contains more than 30 character.',
                'string.empty': 'User first name can not be empty.',
                'any.required': 'User first name must be assign.'
            }),
            secondName: Joi.string().allow(null).trim().min(2).max(30).messages({
                'string.min': 'User second name must contains at least 2 non whitespace character.',
                'string.max': 'User second name can not contains more than 30 character.',
                'string.empty': 'User second name can not be empty.',
                'any.required': 'User second name must be assign.'
            }),
            email: Joi.string().trim().max(50).email().required().messages({
                'string.email': 'Incorrect email format.',
                'string.max': 'email length can not be more than 50 characters.',
                'string.empty': 'email can not be empty.',
                'any.required': 'email must be assign.'
            }),
            sex: Joi.string().allow(null).valid('male', 'female').messages({
                'any.only': 'sex must be one of: male, female.'
            }),
            photoPath: Joi.string().allow(null).trim().length(32).messages({
                'string.length': 'photo path length must be equal to 32 characters and must be md5 hash.'
            })
        });
    }

    assertUpdatedUserIsValid(updatedUser) {
        if(updatedUser == null) throw new ValidationException('Missing data for user update.');
        const {error, value} = this.#updatedUserSchema.validate(updatedUser, {abortEarly: false});
        if(error) throw new ValidationException(this.#extractMessages(error));
    }

    assertNewUserIsValid(newUser) {
        if(newUser == null) throw new ValidationException('Missing data for user update.');
        const {error, value} = this.#newUserSchema.validate(newUser, {abortEarly: false});
        if(error) throw new ValidationException(this.#extractMessages(error));
    }

    #extractMessages(joiError) {
        return joiError.details.map(errorDetail => errorDetail.message).join(', ');
    }
};

export default ValidationService;