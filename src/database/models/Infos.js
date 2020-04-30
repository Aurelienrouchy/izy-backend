import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const infosSchema = new Schema({
    history: Array
});

const Infos = model('infos', infosSchema); 

export default Infos;