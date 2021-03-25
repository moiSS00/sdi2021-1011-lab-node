module.exports = function(app) {
    app.get("/canciones", function(req, res) {
        let respuesta = "";

        if(req.query.nombre != null)
            respuesta += 'Nombre: ' + req.query.nombre + '<br>';

        if(typeof (req.query.autor) != "undefined")
            respuesta += 'Autor: '+ req.query.autor;


        res.send(respuesta);
    });

    app.post("/cancion", function (req, res) {
        res.send("Canción agregada:" + req.body.nombre + "<br>"
            + " genero :" + req.body.genero + "<br>"
            + " precio: " + req.body.precio);
    });

    app.get('/promo*', function (req, res) {
        res.send('Respuesta patrón promo* ');
    })

};
