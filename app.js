const express  = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const app = express();


const flash = require('connect-flash');

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');



const routes = require('./app/routes/routes');
const user = require('./app/routes/user');
const root = require('./app/routes/root');
const admin = require('./app/routes/admin');
const suscriber = require('./app/routes/suscriber');

const passport = require('./config/passport');

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(fileUpload());

app.set('view engine', 'ejs');

app.use(session({
    secret: 'disfrutaelturismoeneleje',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use(express.static(path.join(__dirname, 'public')));

//routes
app.use('/', routes);
app.use('/user', user);
app.use('/root', root);
app.use('/admin', admin);
app.use('/suscriber', suscriber);

app.get('/', function(req, res) {
  res.render('index');
});


app.use((req, res) => {
  res.render('404');
});

module.exports = app;
