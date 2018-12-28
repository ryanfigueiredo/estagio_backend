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

//configurações
    //sessao
    app.use(session({
        secret: 'teste',
        resave:true,
        saveUninitialized: true
    }))
    app.use(flash())

    //middleware autenticacao mensagens
    app.use((req,res,next)=>{
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
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

        

//rotas
    

    app.get("/", (req, res) => {
        Tarefa.find().populate().sort({prazo: "asc"}).then((tarefas) => {
            res.render("index", {tarefas:tarefas})
        }).catch((err) => {
            req.flash("error_msg", "houve um erro interno")
            res.redirect("/404")
        })
        
    })

//ROTA DE BUSCA para buscar apenas um. 
    // app.get("/tarefa", (req, res) => {
    //     Tarefa.findOne({cliente: req.query.cliente}).then((tarefa) => {
    //         if(tarefa){
    //             res.render("tarefa/index", {tarefa: tarefa})
    //         }else{
    //             req.flash("error_msg", "esta tarefa não existe")
    //             res.redirect("/")
    //         }
    //     }).catch((err) =>{
    //         req.flash("error_msg", "houve um erro interno")
    //         res.redirect("/")
    //     })
    // })

    // app.get("/404", (req, res) => {
    //     res.send("erro 404!")
    // })

//Rota de busca alternativa para buscar vários

app.get("/tarefa", (req, res) => {
    Tarefa.find({cliente: req.query.cliente}).populate().then((tarefas) => {
        if(tarefas){
            res.render("tarefa/index", {tarefas: tarefas})
        }else{
            req.flash("error_msg", "esta tarefa não existe")
            res.redirect("/")
        }
    }).catch((err) =>{
        req.flash("error_msg", "houve um erro interno" +err)
        res.redirect("/")
    })
})

var hbs = require('hbs');
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('checked', function (value, test) {
  if (value == undefined) return '';
  return value == test ? 'checked' : '';
});
app.set('view engine', 'hbs');


    app.use("/admin", admin)
//outros
const PORT = 8081
app.listen(PORT, () => {
    console.log("servidor iniciado...")
})