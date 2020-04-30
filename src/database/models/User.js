import mongoose, { model, isValidObjectId } from 'mongoose';
import jwt from 'jsonwebtoken';
const { Schema } = mongoose;

const UserSchema = new Schema({
    _id: String,
    createAt: Date,
    name: String,
    email: String,
    phone: Number,
    photoURL: String,
    id: String,
    raffles: Array
}, { _id: false });

// Model Methods
UserSchema.methods.generateJWT = (token) => {
    return jwt.sign({token}, process.env.JWT_KEY || 'Prout123')
};

const User = model('user', UserSchema); 

export default User;