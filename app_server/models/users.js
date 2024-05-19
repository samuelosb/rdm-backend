const Mongoose = require("mongoose");

const UserSchema = new Mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        minlength: 6,
        required: function() {
            // Only require a password if the user is not using OAuth
            return !this.isOAuthUser;
        },
    },
    role: {
        type: String,
        enum: ['Basic', 'Admin'],
        default: 'Basic',
        required: true,
    },
    gender: {
        type: String,
        enum: ['Hombre', 'Mujer', 'No binario'],
        default: 'No Binario',
        required: true,
    },
    creationAccountDate: {
        type: Date,
        default: Date.now
    },
    numberOfPosts: {
        type: Number,
        default: 0
    },
    numberOfComments: {
        type: Number,
        default: 0
    },
    favList: [{
        recipeId: {
            type: String,
            required: true,
        },
        addedDate: {
            type: Date,
            default: Date.now,
            required: true,
        }
    }],
    weekPlan: {
        monday: [{
            type: String,
            required: true
         }],
        tuesday: [{
            type: String,
            required: true
        }],
        wednesday: [{
            type: String,
            required: true
        }],
        thursday: [{
            type: String,
            required: true
        }],
        friday: [{
            type: String,
            required: true
        }],
        saturday: [{
            type: String,
            required: true
        }],
        sunday: [{
            type: String,
            required: true
        }]
    },
    // OAuth specific fields
    provider: {
        type: String,
        required: false
    },
    providerId: {
        type: String,
        required: false
    },
    refreshToken: {
        type: String,
        required: false
    },
    isOAuthUser: {
        type: Boolean,
        default: false
    }
});

const Users = Mongoose.model("users", UserSchema);

module.exports = Users;
