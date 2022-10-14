const mongoose = require('mongoose');
// const mongoURI ="mongodb://localhost:27017/inotes"
const mongoURI ="mongodb+srv://devansh:devansh@cluster0.lbowzpv.mongodb.net/?retryWrites=true&w=majority"
const connectToMongo = () =>{
    mongoose.connect(mongoURI, () => {
        console.log("Connected to Mongo");
    })
}

module.exports = connectToMongo;