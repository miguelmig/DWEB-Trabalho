var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

var config = require('./config/env');

mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('Mongo ready: ' + mongoose.connection.readyState))
  .catch((erro)=> console.log('Mongo: erro na conexão: ' + erro))
  

// session
var uuid = require('uuid/v4');
var session = require('express-session');
var FileStore = require('session-file-store')(session)

// auth
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var axios = require('axios')
var flash = require('connect-flash')
var bcrypt = require('bcryptjs')
// ---------------------------------------

var getJWTApiToken = require('./helpers/jwt_helper').getJWTApiToken;

passport.use(new LocalStrategy(
  {usernameField:'email'}, (email,password, done) => {
    axios.get(config.apiURL + '/utilizadores/' + email + '?token=' + getJWTApiToken())
    .then(res => {
      const user = res.data;
      if(!user) {
        return done(null, false, {message: 'Utilizador inexistente!\n'});
      }
      
      if(!bcrypt.compareSync(password, user.password)) {
        console.log('Password errada');
        return done(null, false, {message: 'Password inválida!\n'});
      }
      console.log('Autenticado com sucesso!');
      return done(null, user);
    })
    .catch(err => done(err));
  }
))

// Indica-se ao passport como serializar o utilizador
passport.serializeUser((user, done) => {
  // Serialização do utilizador
  console.log("Vou serializar o user: " + JSON.stringify(user));
  done(null, user.email);
})

// Deserialização a partir do id obtém-se o utilizador
passport.deserializeUser((email, done) => {
  console.log("Vou deserializar o user: " + email)
  axios.get('http://localhost:3003/utilizadores/' + email + '?token=' + getJWTApiToken())
  .then(res => done(null, res.data))
  .catch(err => done(err, false));
})


var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);

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
