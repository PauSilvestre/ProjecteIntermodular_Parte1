var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

//sqlite3
var db = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: 'identifier.sqlite'
    },
    useNullAsDefault: true
});

//GET
//GET mapes
app.get('/api/mapes', function(req, res) {
    db.select('m.ID', 'm.Nom', 'm.Data_eixida', 'm.Foto', 'm.Descripcio', 'm.Millors_agents')
        .from('mapes as m')
        .then(function(data) {
            res.json(data);
        });
});

//GET mapa por ID
app.get('/api/mapes/:id', function(req, res) {
    let id = parseInt(req.params.id);
    db('mapes')
        .where('ID', id)
        .first()
        .then(function(data) {
            res.json({ mapes: data });
        });
});

//GET agents
app.get('/api/agents', function(req, res) {
    db.select('a.ID', 'a.Nom', 'a.Habilitats', 'a.Fecha_eixida_al_joc', 'a.Tipo', 'a.Foto', 'a.Descripció')
        .from('agents as a')
        .then(function(data) {
            res.json(data);
        });
});

//GET agents por ID
app.get('/api/agents/:id', function(req, res) {
    let id = parseInt(req.params.id);
    db.select('a.ID', 'a.Nom', 'a.Habilitats', 'a.Fecha_eixida_al_joc', 'a.Tipo', 'a.Foto', 'a.Descripció')
        .from('agents as a')
        .where('a.ID', id)
        .then(function(data) {
            res.json(data);
        });
});

//DELETE mapes
app.delete('/api/mapes/:id', function(req, res) {
    var id = parseInt(req.params.id);
    db('mapes')
        .where('ID', id)
        .del()
        .then(function(data) {
            res.json(data);
        })
        .catch(function(error) {
            console.log(error);
            res.status(500).json({ error: "No s'ha pogut eliminar el mapa." });
        });
});

// DELETE agents
app.delete('/api/agents/:id', function(req, res) {
    var id = parseInt(req.params.id);
    db('agents')
        .where('ID', id)
        .del()
        .then(function(data) {
            res.json(data);
        })
        .catch(function(error) {
            console.log(error);
            res.status(500).json({ error: "No s'ha pogut eliminar el agent." });
        });
});

//INSERT mapa
app.post('/api/mapes', function(req, res) {
    db('mapes')
        .insert({
            Nom: req.body.title,
            Foto: req.body.image,
            Descripcio: req.body.Descripcio,
            Millors_agents: req.body.Millors_agents,
            Data_eixida: req.body.Data_eixida
        })
        .then(() => {
            res.send("OK");
        })
        .catch(function(error) {
            console.log(error);
            res.status(500).json({ error: "Error al insertar mapa." });
        });
});

// PUT mapa
app.put('/api/mapes/:id', function(req, res) {
    let id = parseInt(req.params.id);

    db('mapes')
        .where('ID', id)
        .update({
            Nom: req.body.title,
            Foto: req.body.image,
            Descripcio: req.body.Descripcio,
            Data_eixida: req.body.Data_eixida,
            Millors_agents: req.body.Millors_agents
        })
        .then(() => {
            res.send("OK");
        })
        .catch(function(error) {
            console.log("Error modificant el mapa:", error);
            res.status(500).send("Error modificant el mapa");
        });
});

// INSERT agent
app.post('/api/agents', function(req, res) {
    db('agents')
        .insert({
            Nom: req.body.title,
            Habilitats: req.body.Habilitats,
            Fecha_eixida_al_joc: req.body.Fecha_eixida_al_joc,
            Tipo: req.body.Tipo,
            Foto: req.body.image,
            Descripció: req.body.Descripció
        })
        .then(() => res.send("OK"))
        .catch(error => {
            console.log(error);
            res.status(500).json({ error: "Error al insertar agent." });
        });
});

// UPDATE agent
app.put('/api/agents/:id', function(req, res) {
    let id = parseInt(req.params.id);
    db('agents')
        .where('ID', id)
        .update({
            Nom: req.body.title,
            Habilitats: req.body.Habilitats,
            Fecha_eixida_al_joc: req.body.Fecha_eixida_al_joc,
            Tipo: req.body.Tipo,
            Foto: req.body.image,
            Descripció: req.body.Descripció
        })
        .then(() => res.send("OK"))
        .catch(error => {
            console.log(error);
            res.status(500).json({ error: "Error al modificar agent." });
        });
});

// GET
app.get('/api/habilitats', (req, res) => {
    db.select('*').from('habilitats')
        .then(data => res.json(data))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener habilitats' });
        });
});

// GET habilitat
app.get('/api/habilitats/:id', (req, res) => {
    const id = parseInt(req.params.id);
    db('habilitats').where('ID', id).first()
        .then(data => {
            if (data) {
                res.json({ habilitat: data });
            } else {
                res.status(404).json({ error: 'Habilitat no trobada' });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Error al obtenir habilitat' });
        });
});

// CREAR habilitat
app.post('/api/habilitats', (req, res) => {
    const novaHabilitat = {
        Descripcio_ultimate: req.body.Descripcio_ultimate,
        ID_personajes: parseInt(req.body.ID_personajes),
        Habilitat1: req.body.Habilitat1,
        Habilitat2: req.body.Habilitat2,
        Habilitat3: req.body.Habilitat3,
        Ultimate: req.body.Ultimate,
    };

    db('habilitats').insert(novaHabilitat)
        .then(() => {
            res.status(201).json({ message: 'Habilitat creada' });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Error al crear habilitat' });
        });
});


// MODIFICART habilitat
app.put('/api/habilitats/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const habilitatModificada = {
        ID_personajes: parseInt(req.body.ID_personajes),
        Habilitat1: req.body.Habilitat1,
        Habilitat2: req.body.Habilitat2,
        Habilitat3: req.body.Habilitat3,
        Ultimate: req.body.Ultimate,
        Descripcio_ultimate: req.body.Descripcio_ultimate
    };

    db('habilitats').where('ID', id).update(habilitatModificada)
        .then(count => {
            if (count) {
                res.json({ message: 'Habilitat modificada' });
            } else {
                res.status(404).json({ error: 'Habilitat no trobada' });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Error al modificar habilitat' });
        });
});

// DELETE habilitat
app.delete('/api/habilitats/:id', (req, res) => {
    const id = parseInt(req.params.id);

    db('habilitats').where('ID', id).del()
        .then(count => {
            if (count) {
                res.json({ message: 'Habilitat eliminada' });
            } else {
                res.status(404).json({ error: 'Habilitat no trobada' });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Error al eliminar habilitat' });
        });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
