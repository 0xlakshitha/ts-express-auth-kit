import Joi from "joi";

export const signUpValidation = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(), 
    mobile: Joi.string().required(),
    nic: Joi.string().required(),
    sponsor: Joi.string().required(),
    username: Joi.string().min(6).max(20).required(),
    password: Joi.string().min(8).required(),
    profilePic: Joi.string().optional()
})

export const singInValidation = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
})

export const emailVerificationValidation = Joi.object({
    otp: Joi.string().max(6).min(6).required()
})

export const passwordChangeValidation = Joi.object({
    password: Joi.string().min(8).required(),
    oldPassword: Joi.string().required()
})

export const forgotPasswordValidation = Joi.object({
    username: Joi.string().required()
})

export const resetPasswordValidation = Joi.object({
    secret: Joi.string().required(),
    password: Joi.string().min(8).required()
})

export const checkUsernameValidation = Joi.object({
    username: Joi.string().required()
})

