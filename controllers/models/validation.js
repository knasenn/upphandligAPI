//Validation part1
const Joi = require("@hapi/joi");

//registration Validation
const registerValidation = data => {
    const schema = Joi.object({
        name: Joi.string().min(2).required(),
        email: Joi.string().min(2).required().email(),
        password: Joi.string().min(2).required()
    });
    return schema.validate(data);
};

//login Validation
const loginValidation = data => {
    const schema = Joi.object({
        email: Joi.string().min(2).required().email(),
        password: Joi.string().min(2).required()
    });
    return schema.validate(data);
};

//login Validation
const addValidation = data => {
    const schema = Joi.object({
        type: Joi.string().min(2).required(),
        name: Joi.string().min(2).required(),
        value: Joi.string().min(2).required(),
        skall: Joi.string().min(2).required(),
        brand: Joi.string().min(2).required()
    });
    return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.addValidation = addValidation;
