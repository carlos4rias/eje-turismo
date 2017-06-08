const express = require('express');
const passport = require('../../config/passport');
const passwordRecovery = require('../models/password_link');
const User =  require('../models/user');
const nodemailer = require('nodemailer');
const moment = require('moment');
const config = require('../../config');

const utils = require('../../config/utils');

const user = express.Router();

user.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

user.get('/login', function(req, res) {
  res.render('users/login.ejs', { message: req.flash('loginMessage') });
});

user.post('/login', passport.authenticate('local-login', {
    failureRedirect : '/user/login',
    failureFlash : true
  }),
  (req, res) => {
    if (req.user.local.role === 'root') {
      return res.redirect('/root');
    } else if (req.user.local.role === 'suscriber') {
      return res.redirect('/suscriber/map');
    } else if (req.user.local.role === 'admin') {
      return res.redirect('/admin/map');
    } else {
      req.logout();
      res.redirect('/');
    }
});

user.get('/signup', function(req, res) {
  res.render('users/signup.ejs', { message: req.flash('signupMessage') });
});


user.post('/signup', passport.authenticate('local-signup', {
    session: false,
    failureRedirect : '/user/signup',
    failureFlash : true
  }),
  (req, res) => {
    return res.render('users/created');
  }
);

user.get('/password_recovery', function(req, res) {
  res.render('users/password_recovery', { message: req.flash('signupMessage') });
});

user.post('/password_recovery', (req, res) => {
  let email = req.body.email.toLowerCase();
  User.findOne({"local.email" : email}, (err, data) => {
    if (err) return res.render('users/password_recovery', {message : 'Hubo un error mientras se procesaba la solicitud'});
    if (!data) return res.render('users/password_recovery', {message : 'No hay un usuario con ese email'});
    npass = new passwordRecovery();
    npass.email = email;

    npass.save((err, npassg) => {
      if (err) return res.render('users/password_recovery', {message : 'Hubo un error mientras se procesaba la solicitud'});

      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: utils.email,
          pass: utils.epass
        }
      });

      let html = '<h1>Recibimos una peticion para restaurar la contrasena en la pagina ejeturismo</h1>';
      html += '<b> sigue el link para restaurar tu contrasena </b>';
      html += config.link_web() + 'user/password_recovery/' + npassg._id;
      console.log(html);
      console.log(email);

      let mailOptions = {
        from: '"EJE turismo" <ejeturismo@gmail.com>',
        to: email,
        subject: 'Recuperacion contrasena ejeturismo ✔',
        text: 'Saludos',
        html: html
      };
      console.log(npassg._id);
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.render('users/password_recovery', {message : 'Hubo un error mientras se procesaba la solicitud'});
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        return res.render('users/password_recovery', {message : 'Se ha enviado un link para recuperar el password a tu email'});
      });

    })
  })
});

user.get('/password_recovery/:_id', (req, res) => {
  console.log(req.params._id);
  let id = req.params._id;
  //console.log('id: ' + id);
  passwordRecovery.findOne({'_id' : id}, (err, link) => {
    if (err) return res.render('error', {error: 'Hubo un error'});
    //console.log(link);
    if (!link) return res.render('link_expired');
    let dtnow = (moment().unix() - link.created) / 3600;
    //console.log(dtnow);

    if (dtnow > 1.0) {
        return res.render('link_expired');
    } else {
      return res.render('users/password_recovery_form', {id, message:''});
    }
  });
});

user.post('/password_set/', (req, res) => {
  let id = req.body.link;
  console.log('id: ' + id);
  passwordRecovery.findOne({'_id' : id}, (err, link) => {
    if (err) return res.render('error', {error: 'Hubo un error'});
    //console.log(link);
    if (!link) return res.render('link_expired');
    let dtnow = (moment().unix() - link.created) / 3600;

    if (dtnow > 1.0) {
        return res.render('link_expired');
    } else {
      console.log(link);
      User.findOne({"local.email" : link.email}, (err, data) => {
        let npass = data.generateHash(req.body.password);
        User.findByIdAndUpdate(data._id, {'local.password' : npass}, (err, nuser) => {
          if (err) return res.render('error', {error: 'Hubo un cambiando tu contrasena'});
          console.log(nuser);
          console.log('pass: ' + npass);
          return res.render('users/login', {message:'Tu contrasena se ha cambiado correctamenta, ingresa con tu email y la nueva contrasena'});
        })
      });

    }

  });
});

module.exports = user;
