import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const TicketSchema = new Schema({
    current: Array,
    finished: Number
});

const Ticket = model('ticket', TicketSchema); 

export default Ticket;