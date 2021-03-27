module.exports = function(app, swig) {

    app.get("/autores/agregar", function(req, res) {
        var roles = ["Cantante","Batería","Guitarrista","Bajista","Teclista"];
        let respuesta = swig.renderFile('views/autores-agregar.html', { roles: roles});
        res.send(respuesta);
    });

    app.post("/autor", function (req, res) {
        let respuesta = "";

        if(typeof (req.body.nombre) == "undefined" || req.body.nombre == null) {
            respuesta += "Nombre no enviado en la petición<br>";
        }
        else {
            respuesta += "Nombre: " + req.body.nombre + "<br>";
        }

        if(typeof (req.body.grupo) == "undefined" || req.body.grupo == null) {
            respuesta += "Grupo no enviado en la petición<br>";
        }
        else {
            respuesta += " Grupo: " + req.body.grupo + "<br>";
        }

        if(typeof (req.body.rol) == "undefined" || req.body.rol == null) {
            respuesta += "Rol no enviado en la petición<br>";
        }
        else {
            respuesta += " Rol: " + req.body.rol + "<br>";
        }

        res.send(respuesta);
    });

    app.get("/autores/", function(req, res) {

        let autores = [ {
            "nombre" : "Autor 1",
            "grupo" : "Grupo 1",
            "rol" : "Guitarrista"
        }, {
            "nombre" : "Autor 2",
            "grupo" : "Grupo 2",
            "rol" : "Bajista"
        }, {
            "nombre" : "Autor 3",
            "grupo" : "Grupo 3",
            "rol" : "Guitarrista"
        }]

        let respuesta = swig.renderFile('views/autores.html', {
            autores : autores
        });

        res.send(respuesta);
    });

    app.get("/autores/*", function(req, res) {
        res.redirect("/autores");
    });
};