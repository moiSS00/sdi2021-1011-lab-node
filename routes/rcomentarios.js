module.exports = function(app, swig, gestorBD) {

    app.post("/comentario/:cancion_id", function(req, res) {

        let comentario = {
            autor : req.session.usuario,
            texto : req.body.texto,
            cancion_id: gestorBD.mongo.ObjectID(req.params.cancion_id)
        }

        gestorBD.insertarComentario(comentario, function (id) {
            if(id == null) {
                res.send("Error al insertar el comentario.");
            } else {
                res.redirect("/cancion/" + req.params.cancion_id);
            }
        })
    });

};