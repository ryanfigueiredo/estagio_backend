const express = require("express")
const router = express.Router()

const mongoose = require("mongoose")
require("../models/Tarefa")
const Tarefa = mongoose.model("tarefas")


router.get("/", (req,res) => {
    res.render("admin/index")
})


router.get("/posts", (req,res) => {
    res.send("página de posts")
})

router.get("/tarefas", (req,res) => {
    Tarefa.find().then((tarefas)=>{
        res.render("admin/tarefas", {tarefas: tarefas})
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao listar as tarefas")
    })
    
})


router.get("/tarefas/add", (req,res) => {
    res.render("admin/addtarefas")
})

router.post("/tarefas/nova", (req, res) => {

    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null ){
        erros.push({texto: "nome inválido"})
    }

    if(erros.length > 0){
        res.render("admin/addtarefas", {erros: erros})
    }else{

        const novaTarefa = {
            nome: req.body.nome,
            descricao: req.body.descricao,
            prazo: req.body.prazo,
            prioridade: req.body.prioridade,
            concluida: req.body.concluida,
            cliente: req.body.cliente
        }

    
        new Tarefa(novaTarefa).save().then(() => {
            req.flash("success_msg", "Tarefa enviada com sucesso")
            console.log("Tarefa enviada com sucesso")
           res.redirect("/admin/tarefas")
        }).catch((erro)=>{
            req.flash("error_msg", "Erro ao enviar tarefa")
            console.log("erro ao enviar tarefa"+erro)
            res.redirect("/admin/tarefas")
        })

    }
})






//rota edit

router.get("/tarefas/edit/:id", (req,res) => {
    Tarefa.findOne({_id:req.params.id}).then((tarefa)=>{
        res.render("admin/edittarefas", {tarefa:tarefa})
    }).catch((erro)=>{
        req.flash("error_msg", "esta tarefa não existe")
        res.redirect("/admin/tarefas")
    })
    
})


router.post("/tarefa/edit", (req, res) => {
    Tarefa.findOne({_id: req.body.id}).then((tarefa) => {
        tarefa.nome = req.body.nome
        tarefa.descricao = req.body.descricao
        tarefa.prazo = req.body.prazo
        tarefa.prioridade = req.body.prioridade
        tarefa.concluida = req.body.concluida
        tarefa.cliente = req.body.cliente
        
        tarefa.save().then(() => {
            req.flash("success_msg", "Tarefa editada com sucesso!")
            res.redirect("/admin/tarefas")
        }).catch((err) => {
            req.flash("error_msg", "houve um erro interno ao salvar a edição da tarefa ")
            res.redirect("/admin/tarefas")
        })
    }).catch((err) => {
        req.flash("error_msg", "houve um erro ao editar a tarefa")
        res.redirect("/admin/tarefas")
    })
})

router.post("/tarefas/deletar", (req,res) => {
    Tarefa.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Tarefa removida com sucesso!")
        res.redirect("/admin/tarefas")
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao remover a tarfa")
        res.redirect("/admin/tarefas")
    })
})


module.exports = router