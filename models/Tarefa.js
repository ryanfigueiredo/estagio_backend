const mongoose = require("mongoose")
const Schema = mongoose.Schema



// CRIAÇÃO DE OBJETO TAREFA COM SEUS TRIBUTOS. 
const Tarefa = new Schema({
    nome:{
        type: String,
        required: true
    },
    descricao: {
        type: String,
        default: 'Descrição não informada'
    },
    prazo: {
        type: Date,
        default: Date.now()
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
    }

})

mongoose.model("tarefas", Tarefa)