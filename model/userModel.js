const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
    userName: {type: String, required: true},
    userEmail: {
        type: String, 
        required: true, 
        unique: true, 
        match: [/(([a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)|(".+"))@(([0-9]{1,3}\.([0-9]{1,3})){2,}|([a-zA-Z_]+(\.[a-zA-Z_]+)+))/, 'Please Provide a valid email']
    },
    userPhone: {type: Number, required: true},
    userNationality: {type: String, required: true},
    userState: {type: String, required: true},
    userPassword: {type: String, required: true},
    isVerified: {type: Boolean, default: false},
    pending: {type: Boolean, default: true},
    verificationToken: String,
    verificationTokenExpires: Date,
    resetToken: String,
    resetTokenExpires: Date
})

userSchema.pre('save', async function () {
     // Only hash the password if it is modified
     if (!this.isModified("userPassword")) return next();

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.userPassword, salt)
    this.userPassword = hashedPassword

    next(); // Call next() to proceed
})

userSchema.methods.createJwt = function () {
    return jwt.sign({
        userId: this._id,
        userName: this.userName
    },
    process.env.JWT_SECRET,
    {expiresIn: '30d'}
)}

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.userPassword)
}


module.exports = mongoose.model('userSchema', userSchema)