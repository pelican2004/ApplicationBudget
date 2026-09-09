const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Prenumele este obligatoriu"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Numele este obligatoriu"],
      trim: true,
    },
    birthDate: {
      type: Date,
      required: [true, "Data nașterii este obligatorie"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Sexul este obligatoriu"],
    },
    phone: {
      type: String,
      required: [true, "Numărul de telefon este obligatoriu"],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Emailul este obligatoriu"],
      unique: true,
      lowercase: true,
      trim: true,

      validate: {
        validator: validator.isEmail,
        message: "Adresa de email nu este validă",
      },
    },
    password: {
      type: String,
      required: [true, "Parola este obligatorie"],
      minlength: [
        6,
        "Parola trebuie să aibă minimum 6 caractere",
      ],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationCode: {
      type: String,
      default: null,
    },

    verificationCodeExpire: {
      type: Date,
      default: null,
    },
    resetPasswordCode: {
      type: String,
      default: null,
    },

    resetPasswordCodeExpire: {
      type: Date,
      default: null,
    },
deleteAccountCode: {
  type: String,
  default: null,
},
deleteAccountCodeExpire: {
  type: Date,
  default: null,
},
    avatar: {
      type: String,
      default: "",
    },
    
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);
