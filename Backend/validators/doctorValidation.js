import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

export const doctorRegisterSchema = {
    name: {
        exists: { errorMessage: "The name field is required" },
        notEmpty: { errorMessage: "The name cannot be empty" },
        isString: { errorMessage: "Name must be a string" },
        trim: true
    },
    email: {
        exists: { errorMessage: "The email field is required" },
        notEmpty: { errorMessage: "The email cannot be empty" },
        isEmail: { errorMessage: "Email should be of valid form" },
        trim: true,
        normalizeEmail: true,
        custom: {
            options: async function (value) {
                try {
                    const user = await User.findOne({ email: value });
                    const doctor = await Doctor.findOne({ email: value });
                    if (user || doctor) {
                        throw new Error("The email is already taken");
                    }
                } catch (err) {
                    throw new Error(err.message);
                }
                return true;
            }
        }
    },
    password: {
        exists: { errorMessage: "The password field is required" },
        notEmpty: { errorMessage: "The password should not be empty" },
        isStrongPassword: {
            options: {
                minLength: 8,
                minUppercase: 1,
                minLowercase: 1,
                minNumber: 1,
                minSymbol: 1
            },
            errorMessage: "The password should contain at least one uppercase, one lowercase, one symbol, and must be 8 characters long"
        },
        trim: true
    },
    phone: {
        exists: { errorMessage: "The phone field is required" },
        isMobilePhone: {
            options: ['en-IN'],
            errorMessage: "Phone Number is invalid"
        }
    },
    specialization: {
        exists: { errorMessage: "Specialization is required" },
        notEmpty: { errorMessage: "Specialization cannot be empty" },
        isString: { errorMessage: "Specialization must be a string" },
        trim: true
    },
    hospital: {
        optional: true,
        isString: { errorMessage: "Hospital must be a string" },
        trim: true
    },
    experience: {
        optional: true,
        isInt: { options: { min: 0 }, errorMessage: "Experience must be a positive number" }
    }
};

export const doctorUpdateSchema = {
    name: {
        optional: true,
        notEmpty: { errorMessage: "Name cannot be empty" },
        isString: { errorMessage: "Name must be a string" },
        trim: true
    },
    phone: {
        optional: true,
        isMobilePhone: {
            options: ['en-IN'],
            errorMessage: "Phone Number is invalid"
        }
    },
    specialization: {
        optional: true,
        notEmpty: { errorMessage: "Specialization cannot be empty" },
        isString: { errorMessage: "Specialization must be a string" },
        trim: true
    },
    hospital: {
        optional: true,
        isString: { errorMessage: "Hospital must be a string" },
        trim: true
    },
    experience: {
        optional: true,
        isInt: { options: { min: 0 }, errorMessage: "Experience must be a positive number" }
    },
    availableTime: {
        optional: true,
        isArray: { errorMessage: "Available time must be an array of time slot strings" }
    }
};
