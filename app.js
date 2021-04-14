// Módulos
let express = require('express');
let app = express();

let fs = require('fs');
let https = require('https');

let expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));
let crypto = require('crypto');
let fileUpload = require('express-fileupload');
app.use(fileUpload());
let mongo = require('mongodb');
let swig = require('swig');
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);

// routerUsuarioSession
var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function(req, res, next) {
    console.log("routerUsuarioSession");
    if ( req.session.usuario ) {
        // dejamos correr la petición
        next();
    } else {
        console.log("va a : "+req.session.destino)
        res.redirect("/identificarse");
    }
});
//Aplicar routerUsuarioSession
app.use("/canciones/agregar",routerUsuarioSession);
app.use("/publicaciones",routerUsuarioSession);
app.use("/comentario",routerUsuarioSession);
app.use("/favoritos",routerUsuarioSession);
app.use("/cancion/comprar",routerUsuarioSession);
app.use("/compras",routerUsuarioSession);


//routerUsuarioAutor
let routerUsuarioAutor = express.Router();
routerUsuarioAutor.use(function(req, res, next) {
    console.log("routerUsuarioAutor");
    let path = require('path');
    let id = path.basename(req.originalUrl);
// Cuidado porque req.params no funciona
// en el router si los params van en la URL.
    gestorBD.obtenerCanciones(
        {_id: mongo.ObjectID(id) }, function (canciones) {
            console.log(canciones[0]);
            if(canciones[0].autor == req.session.usuario ){
                next();
            } else {
                res.redirect("/tienda");
            }
        })
});
//Aplicar routerUsuarioAutor
app.use("/cancion/modificar",routerUsuarioAutor);
app.use("/cancion/eliminar",routerUsuarioAutor);


//routerAudios
let routerAudios = express.Router();
routerAudios.use(function(req, res, next) {
    console.log("routerAudios");
    let path = require('path');
    let idCancion = path.basename(req.originalUrl, '.mp3');
    gestorBD.obtenerCanciones(
        {"_id": mongo.ObjectID(idCancion) }, function (canciones) {
            if(req.session.usuario && canciones[0].autor == req.session.usuario ){
                next();
            } else {
                let criterio = {
                    usuario : req.session.usuario,
                    cancionId : mongo.ObjectID(idCancion)
                };

                gestorBD.obtenerCompras(criterio ,function(compras){
                    if (compras != null && compras.length > 0 ){
                        next();
                    } else {
                        res.redirect("/tienda");
                    }
                });
            }
        })
});
//Aplicar routerAudios
app.use("/audios/",routerAudios);

// routerComentarios
var routerComentarios = express.Router();
routerComentarios.use(function(req, res, next) {
    console.log("routerComentarios");
    let path = require('path');
    let idComentario = path.basename(req.originalUrl);
    gestorBD.obtenerComentarios(
        {"_id": mongo.ObjectID(idComentario) }, function (comentarios) {
            if(req.session.usuario && comentarios[0].autor == req.session.usuario ){
                next();
            } else {
                res.send("No puede borrar un comentario que no es de su propiedad.");
            }
        });
});
//Aplicar routerComentarios
app.use("/comentario/borrar/",routerComentarios);

// router compras
var routerCompras = express.Router();
routerCompras.use(function(req, res, next) {
    console.log("routerCompras");
    let path = require('path');
    let idCancion = path.basename(req.originalUrl);

    gestorBD.obtenerCanciones(
        {_id: mongo.ObjectID(idCancion) }, function (canciones) {
            console.log(canciones[0]);
            if(canciones[0].autor != req.session.usuario ){

                let criterio = {
                    usuario : req.session.usuario,
                    cancionId : mongo.ObjectID(idCancion)
                };

                gestorBD.obtenerCompras(criterio ,function(compras){
                    if (compras != null && compras.length > 0 ){
                        res.redirect("/tienda");
                    } else {
                       next();
                    }
                });
            } else {
                res.redirect("/tienda");
            }
        })
});
app.use("/cancion/comprar/",routerCompras);



app.use(express.static('public'));


// Variables
app.set('port', 8081);
app.set('db','mongodb://admin:SDIadmin@tiendamusica-shard-00-00' +
    '.bnsce.mongodb.net:27017,tiendamusica-shard-00-01' +
    '.bnsce.mongodb.net:27017,tiendamusica-shard-00-02' +
    '.bnsce.mongodb.net:27017/tiendamusica?ssl=true&replicaSet=atlas-2mlqk1-shard-' +
    '0&authSource=admin&retryWrites=true&w=majority');
app.set('clave','abcdefg');
app.set('crypto',crypto);

//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, gestorBD);
require("./routes/rcanciones.js")(app, swig, gestorBD);
require("./routes/rautores.js")(app, swig, gestorBD);
require("./routes/rcomentarios.js")(app, swig, gestorBD);
require("./routes/rfavoritos.js")(app, swig, gestorBD);
require("./routes/rapicanciones.js")(app, gestorBD);


app.get('/', function (req, res) {
    res.redirect('/tienda');
})

app.use( function (err, req , res, next) {
    console.log("Error producido: " + err);
    if(! res.headersSent) {
        res.status(400);
        let respuesta = swig.renderFile('views/error.html',
            {
                mensajeError : "Recurso no disponible",
            });
        res.send(respuesta);
    }
});

// Lanzar el servidor
https.createServer({
    key: fs.readFileSync('certificates/alice.key'),
    cert: fs.readFileSync('certificates/alice.crt')
}, app).listen(app.get('port'), function() {
    console.log("Servidor activo");
});


