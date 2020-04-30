import { connect, connection } from 'mongoose';

const url = 'mongodb://aurelien:Prout123.!@ds211709.mlab.com:11709/izy';

connect(
    url, 
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
    }
);

connection.once('open', () => console.log(`Connected to mongo at ${url}`));