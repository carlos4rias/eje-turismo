const express = require('express');
const nodemailer = require('nodemailer');
const moment = require('moment');
const root = express.Router();

const User = require('../../app/models/user');
const utils = require('../../config/utils');
const Link = require('../../app/models/activation_link');

const config = require('../../config');


const authMiddleware = require('../../middlewares/auth');

root.get('/', authMiddleware.isLoggedIn, authMiddleware.isRoot, (req, res) => {
  //console.log(req.user.local);
  user = {
    email : req.user.local.email,
    name : req.user.local.name,
    dni : req.user.local.dni,
    phone : req.user.local.phone,
    city : req.user.local.city
  }

  User.aggregate([
    {
      $lookup: {
        from: 'interests',
        localField: '_id',
        foreignField: 'id_user',
        as: 'interestings'
      }
    }],
    function (err, data) {
      //console.log(data);
      return res.render('root', {user: req.user.local, admins: data});
    }
 );
});

root.get('/deactivation/:_id', authMiddleware.isLoggedIn, authMiddleware.isRoot, (req, res) => {
  let id = req.params._id;
  User.findByIdAndUpdate(id, {'local.active' : 'false'}, (err, updated) => {
    if (err) return res.render('error', {error: 'Hubo un error mientras se activaba su usuario'})
    //console.log(updated);
    return res.redirect('/root');
  });
});

root.get('/activation/:_id', authMiddleware.isLoggedIn, authMiddleware.isRoot, (req, res) => {
  //console.log(req.params._id);
  let link = new Link();
  link.user_dni = req.params._id + '&' + link._id + link.created;

  link.save((err, linkStored) => {
    //console.log('saved');
    if (err) return res.render('/root');
    User.findOne({'_id' : req.params._id}, (err, user) => {
      if (err) return res.render('/root');
      //console.log('user: ' + user.local);

      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: utils.email,
          pass: utils.epass
        }
      });

      let html = '<h1>Recibimos una peticion para activar la cuenta en ejeturismo</h1>';
      html += '<b> sigue el link para activar tu cuenta </b>';
      html += config.link_web() + 'mail/' + linkStored.user_dni;
      console.log(html);

      let mailOptions = {
        from: '"EJE turismo" <ejeturismo@gmail.com>',
        to: user.local.email,
        subject: 'Activacion ejeturismo ✔',
        text: 'Saludos',
        html: html
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        return res.redirect('/root');
      });


      //console.log(link);
    });
  });
});

module.exports = root;
