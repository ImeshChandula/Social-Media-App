const mongoose = require("mongoose");
const ROLES = require("../config/roles");

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    password: { 
        type: String, 
        required: true, 
        minlength: 8 
    },
    confirmPassword: { 
        type: String, 
        required: true, 
        minlength: 8 
    },
    firstName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    lastName: { 
        type: String, 
        required: true, 
        trim: true 
    },

    // not required
    profilePicture: { type: String, default: 'default-profile.png' },
    coverPhoto: { type: String, default: 'default-cover.png' },
    bio: { type: String, maxlength: 250 },
    location: { type: String },
    birthday: { type: Date },


    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    friendRequests: [{
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending'
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
    }],

    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },



    role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.USER,
    },
    status: {
        type: String,
        enum: ["active", "inactive", "banned"],
        default: "active",
    },
    
}, { timestamps: true });


const User = mongoose.model("User", UserSchema);
module.exports = User;