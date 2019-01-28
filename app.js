//carregando modulos
    const express = require("express")
    const handlebars = require("express-handlebars")
    const bodyParser = require("body-parser")
    const app = express()
    const admin = require("./routes/admin")
    const path = require("path")
    const mongoose = require("mongoose")
    const session = require("express-session")
    const flash = require("connect-flash")
    require("./models/Tarefa")
    const Tarefa = mongoose.model("tarefas")
    const usuarios = require("./routes/usuario")
    const passport = require("passport")
    require("./config/auth")(passport)
    const {eAdmin} = require("./helpers/eAdmin")

//configurações

    //sessao
    app.use(session({
        secret: 'teste',
        resave:true,
        saveUninitialized: true
    }))


    app.use(passport.initialize())
    app.use(passport.session())


    app.use(flash())

    //middleware autenticacao mensagens
    app.use((req,res,next)=>{
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null;
        next()
    })

    //body parser
        app.use(bodyParser.urlencoded({extended:true}))
        app.use(bodyParser.json())

    //Handlebars
        app.engine("handlebars", handlebars({defaultLayout: "main"}))
        app.set("view engine" , "handlebars")

    //mongoose
        mongoose.Promise = global.Promise
        mongoose.connect("mongodb://localhost/estagio").then(() => {
            console.log("conectado ao mongo...")
        }).catch((erro) => {
            console.log("erro ao se conectar: "+erro)
        })

    //public
        app.use(express.static(path.join(__dirname, "public")))

        


    //rota principal após logar - apresenta apenas tarefas do usuario
    app.get("/", eAdmin, (req, res) => {
        Tarefa.find({UsuarioID: req.user._id}).populate('Usuario').then((tarefas) => {
            res.render("index", {tarefas:tarefas})
        }).catch((err) => {
            req.flash("error_msg", "houve um erro interno")
            res.redirect("/404")
        })        
    })

    app.get("/404", (req, res) => {
        res.send("erro 404!")
    })
     

    // [TERMINAR] - BUSCA POR VARIOS CAMPOS DE UMA SO VEZ 
    app.get("/tarefa", (req, res) => {
        Tarefa.find().or([{ nome: req.params.nome }, { cliente: req.params.cliente  }]).then((tarefas) => {
            if(tarefas.length > 0){
                res.render("tarefa/index", {tarefas: tarefas})
            }else{
                req.flash("error_msg", "Este cliente não existe")
                res.redirect("/") 
                

            }
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro interno: " +err)
            res.redirect("/")
        })
    })



    app.use("/admin", admin)
    app.use("/usuarios", usuarios)


//PORTA - CONEXAO SERVIDOR
const PORT = 8081
app.listen(PORT, () => {
    console.log("servidor iniciado...")
})