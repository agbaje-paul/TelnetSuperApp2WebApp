const Joi = require('Joi');

module.exports = function validateRegDetails (body) {
    const schema = Joi.object({
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().error( new Error('This mail format is not valid.')),
        first_name: Joi.string().min(2).max(50).required().label('Please enter a name that is above 2 letters long and below 50 letters.'),
        last_name: Joi.string().min(2).max(50).required().label('Please enter a name that is above 2 letters long and below 50 letters.'),
        phone: Joi.string().min(11).required().label('Please enter a phone number that is valid.'),
        title: Joi.string().min(2).max(50).required().label('Please enter a role that is above 2 letters long and below 50 letters.'),
        password: Joi.string().required().label('Please enter a password.'),
        confirm_password: Joi.string().required().valid(Joi.ref('password')).label('This mail format is not valid.'),
        upline: Joi.number().required().label('Enter an upline.'),
        subsidiary: Joi.number().required().label('Enter a subsidiary.'),
        department: Joi.number().required().label('Please enter a department.'),
        role: Joi.number().required().label('Please enter a role.'),
    });

    return schema.validate(body)
};

// how do you give people new id's