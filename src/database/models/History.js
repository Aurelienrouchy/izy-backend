import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const historySchema = new Schema({
    createAt: Date,
    price: Number,
    user: String,
});

const History = model('history', historySchema); 

export default History;