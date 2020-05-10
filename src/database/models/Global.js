import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const GlobalSchema = new Schema({
        tickets: Object
    }, { 
        collection: 'global'
    }
);

const Global = model('global', GlobalSchema); 

export default Global;