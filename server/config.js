const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb+srv://pawarranjit084:VGEZUD1VCH7LmBsh@cluster0.l5jjfvd.mongodb.net/Program?retryWrites=true&w=majority&appName=Cluster0");


connect.then(() => {
    console.log("Database Connected Successfully");
})
.catch(() => {
    console.log("Database cannot be Connected");
})


const Loginschema = new mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    email: {
        type:String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});


const collection = new mongoose.model("user", Loginschema);

module.exports = collection;