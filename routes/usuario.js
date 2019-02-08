const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
passport = require("passport")
const {eAdmin} = require("../helpers/eAdmin")
const path = require("path")
const Tarefa = mongoose.model("tarefas")


// apresentar imagens de public
router.use(express.static("./public"))

// para manipulação de uploads
const multer = require("multer")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        
        const ext = file.originalname.substr(file.originalname.lastIndexOf(".") + 1)
      cb(null, req.user.id + "-" + file.fieldname + '-' + Date.now() + "." + ext)
    }
  })
  
  const upload = multer({ 
      storage: storage,
      limits: {fileSize: 1000000},
      fileFilter: function(req, file, cb) {
          checkFileType(file, cb)
      }
    }).single("avatar")

    // checar tipo de arquivo
function checkFileType(file, cb) {
    const fileTypes = /jpeg|jpg|png/ 
    
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase())
    
    const mimetype = fileTypes.test(file.mimetype)

    if(mimetype && extName){
        return cb(null, true)
    }else{
        cb("x")
    }
}

// rota para adicionar foto ao usuario
router.post("/file", (req, res) => {
    Usuario.findOne({_id: req.user.id}).then((usuario) =>{
        upload(req, res, (err) =>{
            if(err == "x"){
                req.flash("error_msg", "Tipo de arquivo não suportado")
                res.redirect("/usuarios/conta")
            }

            else if(err){
                req.flash("error_msg", "Tamanho de arquivo muito grande")
                res.redirect("/usuarios/conta")
                
            }else{
                if(req.file == undefined){
                    req.flash("error_msg", "nenhum arquivo selecionado")
                    res.redirect("/usuarios/conta")
                    console.log(err)
                }else{
                    if(req.user.avatarUsuario){
                        const fs = require("file-system");
                        fs.unlink(`public/uploads/${req.user.avatarUsuario}`, (err) =>{
                            if(err){
                                console.log(err)
                            }else{
                                console.log("arquivo deletado")
                            }
                        })

                    }
                    usuario.updateOne({
                        avatarUsuario: req.file.filename
                    }).then(() =>{
                        req.flash("success_msg", "Foto atualizada com sucesso")
                        res.redirect("/usuarios/conta")
                    }).catch((err) =>{
                        req.flash("error_msg", "houve um erro ao tentar atualizar sua foto!")
                        res.redirect("/usuarios/conta")
                        console.log(err)
                    })
                }
            }
        })
    })
})


//rota para registrar usuario (ADD)
router.get("/registro", (req,res) => {
    res.render("usuarios/registro")
})

router.post("/registro", (req,res) =>{
    var erros = []

    if(!req.body.sobreNome || typeof req.body.sobreNome == undefined || req.body.sobreNome == null) {
        erros.push({texto: "Sobre Nome não informado ou inválido"})
    }

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        req.body.nome = "Nome não informado"
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({texto: "email inválido"})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({texto: "senha inválido"})
    }

    if(req.body.senha.length < 4){
        erros.push({texto: "senha muito curta"})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "as senhas são diferentes, tente novamente"})
    }

    if(erros.length > 0){
        res.render("usuarios/registro", {erros: erros})
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario) =>{
            if(usuario){
                req.flash("error_msg", "Já existe uma conta com este e-mail")
                res.redirect("/usuarios/registro")
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    sobreNome: req.body.sobreNome,
                    email: req.body.email,
                    senha: req.body.senha
                })
                bcrypt.genSalt(10, (err, salt) =>{
                    bcrypt.hash(novoUsuario.senha, salt, (err, hash) =>{
                        if(err){
                            req.flash("error_msg", "houve um erro durante o salvamento do usuário")
                            res.redirect("/")
                        }
                        novoUsuario.senha = hash
                        novoUsuario.save().then(() =>{
                            req.flash("success_msg", "Usuário registrado com sucesso!")
                            res.redirect("/")
                        }).catch((err) =>{
                            req.flash("error_msg", "houve um erro ao criar o usuário, tente novamente!")
                            res.redirect("/usuarios/registro")
                            console.log(err)
                        })
                    })
                })
            }
        }).catch((err) =>{
            req.flash("error_msg", "houve um erro interno")
            res.redirect("/")
        })
    }
})

// rota após logar: 
router.get("/index", eAdmin, (req, res) => {
    Tarefa.find({UsuarioID: req.user._id}).populate('Usuario').then((tarefas) => {
        res.render("usuarios/index", {tarefas:tarefas})
    }).catch((err) => {
        req.flash("error_msg", "houve um erro interno")
        res.redirect("/404")
    })        
})


router.get("/login", (req,res) =>{
    res.render("usuarios/login")
})


router.post("/login", (req, res, next) =>{
    passport.authenticate("local", {
        successRedirect: "/usuarios/index",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})


router.get("/logout", (req, res) =>{
    req.logOut()
    req.flash("success_msg", "Deslogado com sucesso")
    res.redirect("/")
})


//rota dados da conta
router.get("/conta",  eAdmin, (req,res) => {         
    res.render("usuarios/conta", {
        nome: req.user.nome,
        sobreNome: req.user.sobreNome, 
        email: req.user.email,
        senha: req.user.senha,
        avatarUsuario: req.user.avatarUsuario,
        id: req.user.id})
})

//rota editar usuario
router.get("/editUsuarios/edit/:id", eAdmin, (req, res) =>{
    Usuario.findOne({_id:req.params.id}).then((usuario)=>{
        res.render("usuarios/editUsuarios", {usuario: usuario})
    }).catch((erro)=>{
        req.flash("error_msg", "este usuario nao existe")
        res.redirect("/usuarios/conta")
    })
})



//rota editar usuario 2
router.post("/editUsuario/edit", eAdmin, (req, res) => {
    Usuario.findOne({_id: req.body.id}).then((usuario) =>{
        var erros = []   

        
        if(req.body.senha1.length < 4){
            erros.push({texto: "Senha muito curta"})
            req.redirect("/usuarios/conta")
        }
           
        if(req.body.senha1 != req.body.senha2){
            erros.push({texto: "As novas senhas digitadas são diferentes"})
            req.redirect("/usuarios/conta")
        }
           

        if(erros.length > 0){
                    res.render("usuarios/editUsuarios", {erros: erros})
                    res.redirect("/usuarios/conta", { erros: erros})
                    
         }
         
         else if(bcrypt.compareSync(req.body.senhaAnterior, usuario.senha)) { 
            bcrypt.genSalt(10, (err, salt) =>{
                bcrypt.hash(req.body.senha1, salt, (err, hash) =>{
                    if(err){
                        req.flash("error_msg", "houve um erro durante o salvamento do usuário")
                        res.redirect("/usuarios/conta")
                    }

                    usuario.senha1 = hash
                    usuario.updateOne({
                        id: req.body.id,
                        nome: req.body.nome,
                        sobreNome: req.body.sobreNome,
                        senha: usuario.senha1
                    }).then(() =>{
                        req.flash("success_msg", "Usuário editado com sucesso!")
                        res.redirect("/usuarios/conta")
                    }).catch((err) =>{
                        req.flash("error_msg", "houve um erro ao criar o usuário, tente novamente!")
                        res.redirect("/usuarios/conta")
                        console.log(err)
                    })
                })
            })
         }else{
             req.flash("error_msg", "A senha anterior digitada esta incorreta!")
             res.redirect("/usuarios/conta")
         }
    })
})


module.exports = router



