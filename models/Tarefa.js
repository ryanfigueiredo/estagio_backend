const mongoose = require("mongoose")
const Schema = mongoose.Schema

// CRIAÇÃO DE OBJETO TAREFA COM SEUS TRIBUTOS. 
const Tarefa = new Schema({
    nome:{
        type: String,
        required: true
    },
    descricao: {
        type: String
        
    },
    prazo: {
        type: Date,
    },
    prioridade:{
        type: String,
        required: true
    },
    concluida:{
        type: String,
        required: true
    },
    cliente: {
        type: String,
        required: true
    },

    UsuarioID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuarios',
        required: true
    },
    
    dataDeCriacao: {
        type: Date,
        default: Date.now
    }


})

mongoose.model("tarefas", Tarefa)