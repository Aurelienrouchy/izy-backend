import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const raffleSchema = new Schema({
    createAt: Date,
    price: Number,
    usersCount: Number,
    users: Array
});

const Raffle = model('raffle', raffleSchema); 

export default Raffle;