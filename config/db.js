if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb://cryanfigueiredo:baxuvi180682@ds259154.mlab.com:59154/tarefas" }
}else{
    module.exports = {mongoURI: "mongodb://localhost/estagio"}
}