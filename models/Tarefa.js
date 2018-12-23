const mongoose = require("mongoose")
const Schema = mongoose.Schema

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
        type: Boolean,
        required: true
    },
    concluida:{
        type: String,
        required: true
    }

})

mongoose.model("tarefas", Tarefa)