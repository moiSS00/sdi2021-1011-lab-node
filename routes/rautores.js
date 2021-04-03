module.exports = function(app, swig) {

    app.get("/autores/agregar", function(req, res) {
        var roles = ["cantante","batería","guitarrista","bajista","teclista"];
        let respuesta = swig.renderFile('views/autores-agregar.html', { roles: roles});
        res.send(respuesta);
    });

    app.get("/autores/filtrar/:rol", function(req, res) {

        let autores = [ {
            "nombre" : "Autor 1",
            "grupo" : "Grupo 1",
            "rol" : "guitarrista"
        }, {
            "nombre" : "Autor 2",
            "grupo" : "Grupo 2",
            "rol" : "bajista"
        }, {
            "nombre" : "Autor 3",
            "grupo" : "Grupo 3",
            "rol" : "guitarrista"
        }]

        let rol = req.params.rol;
        let respuesta = "";

        for(let i = 0; i < autores.length; i++) {
            if(autores[i].rol === rol) {
                respuesta += "Nombre: " + autores[i].nombre
                    + " - Grupo: " + autores[i].grupo
                    + " Rol: " + autores[i].rol + "<br>";
            }
        }

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
            "rol" : "guitarrista"
        }, {
            "nombre" : "Autor 2",
            "grupo" : "Grupo 2",
            "rol" : "bajista"
        }, {
            "nombre" : "Autor 3",
            "grupo" : "Grupo 3",
            "rol" : "guitarrista"
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