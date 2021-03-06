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
const db = require("./config/db")


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
    mongoose.connect(db.mongoURI).then(() => {
        console.log("conectado ao mongo...")
    }).catch((erro) => {
        console.log("erro ao se conectar: "+erro)
    })

//public
    app.use(express.static(path.join(__dirname, "public")))


//rota principal de inicio
app.get("/", (req,res) =>{
    res.render("usuarios/login")
})


app.get("/404", (req, res) => {
    res.send("erro 404!")
})
 

app.get("/tarefa", (req, res) => {
     Tarefa.find().or([{ "nome": req.query.todosOsDados },
      {"cliente": req.query.todosOsDados},
      {"descricao": req.query.todosOsDados}]).then((tarefas) => {
        if(tarefas.length > 0){
            res.render("tarefa/index", {tarefas: tarefas})
        }else{
            req.flash("error_msg", "Não há dados para sua pesquisa")
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
const PORT = process.env.PORT ||8081
app.listen(PORT, () => {
console.log("servidor iniciado...")
})