module.exports = function(app, gestorBD) {

    app.get("/api/cancion", function(req, res) {
        gestorBD.obtenerCanciones( {} , function(canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(canciones) );
            }
        });
    });

    app.get("/api/cancion/:id", function(req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)}

        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(canciones[0]) );
            }
        });
    });


    app.delete("/api/cancion/:id", function(req, res) {

        let user = res.usuario;
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)}

        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                res.status(500);
                res.json({
                    error : "La canción indicada no existe"
                })
            } else {
                if(canciones[0].autor == user) {
                    gestorBD.eliminarCancion(criterio,function(canciones){
                        if ( canciones == null ){
                            res.status(500);
                            res.json({
                                error : "se ha producido un error"
                            })
                        } else {
                            res.status(200);
                            res.send( JSON.stringify(canciones) );
                        }
                    });
                } else {
                    res.status(500);
                    res.json({
                        error : "No es el autor de la cancion"
                    })
                }
            }
        });
    });

    app.post("/api/cancion", function(req, res) {

        let errores = [];

        // Comprobamos que se reciben todos los datos esperados
        if(typeof (req.body.nombre) == "undefined" || req.body.nombre == null) {
            errores.push("Debe incluir un nombre");
        }

        if(typeof (req.body.genero) == "undefined" || req.body.genero == null) {
            errores.push("Debe incluir un género");
        }

        if(typeof (req.body.precio) == "undefined" || req.body.precio == null) {
            errores.push("Debe incluir un precio");
        }

        // Comprobamos que su formato es correcto
        let precio = parseFloat(req.body.precio);
        if(!precio) {
            errores.push("El precio debe de ser un número");
        }
        else if (precio < 0){
            errores.push("El precio debe de ser positivo");
        }

        if(errores.length > 0) {
            res.status(401);
            res.json({
                error : errores
            })
        } else {
            let cancion = {
                nombre : req.body.nombre,
                genero : req.body.genero,
                precio : req.body.precio,
            }

            gestorBD.insertarCancion(cancion, function(id){
                if (id == null) {
                    res.status(500);
                    res.json({
                        error : "se ha producido un error"
                    })
                } else {
                    res.status(201);
                    res.json({
                        mensaje : "canción insertada",
                        _id : id
                    })
                }
            });
        }
    });

    app.put("/api/cancion/:id", function(req, res) {

        // Estaría mejor incluir el usuario en el criterio de búsqueda.
        // Cuidado con los códigos de error. (40X para errores de los clientes)

        let user = res.usuario;
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
        let errores = [];

        let cancion = {}; // Solo los atributos a modificar
        if ( req.body.nombre != null)
            cancion.nombre = req.body.nombre;
        if ( req.body.genero != null)
            cancion.genero = req.body.genero;
        if ( req.body.precio != null) {
            if(parseFloat(req.body.precio)) {
                if(parseFloat(req.body.precio) >= 0) {
                    cancion.precio = req.body.precio;
                } else {
                    errores.push("El precio debe de ser positivo");
                }
            } else {
                errores.push("El precio debe de ser un número");
            }
        }
        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                res.status(401);
                errores.push("La canción indicada no existe");
                res.json({
                    error : errores
                })
            } else {
                if(canciones[0].autor == user) {
                    gestorBD.modificarCancion(criterio, cancion, function(result) {
                        if (result == null) {
                            res.status(500);
                            errores.push("se ha producido un error");
                            res.json({
                                error : errores
                            })
                        } else {
                            res.status(200);
                            res.json({
                                mensaje : "canción modificada",
                                _id : req.params.id
                            })
                        }
                    });
                } else {
                    res.status(402);
                    errores.push("No es el autor de la cancion");
                    res.json({
                        error : errores
                    })
                }
            }
        });
    });


    app.post("/api/autenticar/", function (req, res) {
       let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
           .update(req.body.password).digest('hex');

       let criterio = {
           email : req.body.email,
           password : seguro
       }

       gestorBD.obtenerUsuarios(criterio, function (usuarios) {
          if (usuarios == null || usuarios.length == 0) {
              res.status(401);
              res.json({
                  autenticado : false
              });
          } else {
              let token = app.get('jwt').sign(
                  {usuario: criterio.email , tiempo: Date.now()/1000},
                  "secreto");
              res.status(200);
              res.json({
                  autenticado : true,
                  token : token
              });
          }
       });

    });
}
