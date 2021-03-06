const mongoose = require('mongoose')
const Schema = mongoose.Schema


const Usuario = new Schema({

    nome: {
        type:String
    },

    sobreNome: {
        type:String,
        required: true
    },

    email:{
        type: String,
        required: true
    },

    senha:{
        type:String,
        required: true
    },

    eAdmin:{
        type: Number,
        default: 0
    },

    dataDeCriacao: {
        type: Date,
        default: Date.now
    },

    avatarUsuario: {
        type: String
    }

})


const User = mongoose.model('usuarios', Usuario)
module.exports = User