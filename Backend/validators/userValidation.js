import User from "../models/User.js"
import Doctor from "../models/Doctor.js"

export const userRegisterSchema = {

    name: {
        exists: {
            errorMessage: "The name field is required"
        },
        notEmpty: {
            errorMessage: "The name cannot be empty"
        },
        isString: {
            errorMessage: "Name must be a string"
        },

        isLength: {
            options: {
                min: 3,
                max: 20
            },
            errorMessage: "The name should be between 3 and 20 characters long"
        },
        trim: true
    },
    email: {
        exists: {
            errorMessage: "The email field is required"
        },
        notEmpty: {
            errorMessage: "The email cannot be empty"
        },
        isEmail: {
            errorMessage: "email should be of valid form"
        },
        trim: true,
        normalizeEmail: true,
        custom: {
            options: async function (value) {
                try {
                    const user = await User.findOne({ email: value })
                    const doctor = await Doctor.findOne({ email: value })
                    if (user || doctor) {
                        throw new Error("The email is already taken")
                    }

                }
                catch (err) {
                    throw new Error(err.message)
                }
                return true
            }
        }
    },
    password: {
        exists: {
            errorMessage: "The password field is required"
        },
        notEmpty: {
            errorMessage: "The password should not be empty"
        },
        isStrongPassword: {
            options: {
                minLength: 8,
                minUppercase: 1,
                minLowercase: 1,
                minNumber: 1,
                minSymbol: 1
            },
            errorMessage: "The passowrd should contain atleast one upper case , one lower case , one symbol and it must be 8 characters long "
        },
        trim: true
    },
    phno: {
        exists: {
            errorMessage: "The Phno is required"
        },
        isMobilePhone: {
            options: ['en-IN'],
            errorMessage: "Phone Number is invalid"
        }
    }
}

export const userLoginSchema = {
    email: {
        exists: {
            errorMessage: "The email field is required"
        },
        notEmpty: {
            errorMessage: "The email cannot be empty"
        },
        isEmail: {
            errorMessage: "email should be of valid form"
        },
        trim: true,
        normalizeEmail: true,

    },
    password: {
        exists: {
            errorMessage: "The password field is required"
        },
        notEmpty: {
            errorMessage: "The password should not be empty"
        },
        // isStrongPassword: {
        //     options: {
        //         minLength: 8,
        //         minUppercase: 1,
        //         minLowercase: 1,
        //         minNumber: 1,
        //         minSymbol: 1
        //     },
        //     errorMessage: "The passowrd should contain atleast one upper case , one lower case , one symbol and it must be 8 characters long "
        // },
        trim: true
    }
}