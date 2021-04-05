module.exports = function(app, swig, gestorBD) {

    app.get("/favoritos/add/:cancion_id", function(req, res) {

        // Comprobamos si la lista de favoritos está o no inicializada
        if(req.session.favoritos == null) {
            req.session.favoritos = [];
        }

        // Obtenemos de la base de datos la cancion a añadir a la lista de canciones favoritas
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.cancion_id) };
        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if(canciones == null) {
                res.send("Error al recuperar la canción.");
            } else {
                // Comprobamos si la canion esta ya o no incluida en la lista de favoritos
                if(req.session.favoritos.find(cancion => cancion._id.toString() === canciones[0]._id.toString())) {
                    res.send("La canción ya está incluida en la lista de favoritos."); //Si ya estaba incluida
                } else { //Si no está ya incluida
                    req.session.favoritos.push(canciones[0]);
                    res.send("Canción añadida correctamente a favoritos.");
                }
            }
        })
    });

    app.get("/favoritos", function(req, res) {

        //Comprobamos si la lista de favoritos está o no inicializada
        if(req.session.favoritos == null) {
            req.session.favoritos = [];
        }

        // Calculamos el precio
        let precioTotal = 0.0;
        for(let i = 0; i < req.session.favoritos.length; i++) {
            precioTotal += parseFloat(req.session.favoritos[i].precio);
        }

        // Devolvemos la vista con la lista de canciones y el precio total
        let respuesta = swig.renderFile('views/bfavoritos.html',
            {
                canciones : req.session.favoritos,
                precioTotal : precioTotal
            });

        res.send(respuesta);
    });

    app.get("/favoritos/eliminar/:cancion_id", function(req, res) {


        //Comprobamos si la lista de favoritos está o no inicializada
        if(req.session.favoritos == null) {
            req.session.favoritos = [];
        }

        //Eliminamos la cancion específica
        let pos = -1;
        for(let i = 0; i < req.session.favoritos.length; i++) {
            if(req.session.favoritos[i]._id.toString() === req.params.cancion_id) {
                pos = i;
                break;
            }
        }
        if(pos != -1) {
            req.session.favoritos.splice(pos,1);
        }

        //  Recalculamos el precio
        let precioTotal = 0.0;
        for(let i = 0; i < req.session.favoritos.length; i++) {
            precioTotal += parseFloat(req.session.favoritos[i].precio);
        }


        res.send("La canción se ha eliminado de la lista de favoritos correctamente.");
    });

};