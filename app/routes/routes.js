const express = require('express');

const User = require('../../app/models/user');
const Link = require('../../app/models/activation_link');
const Interest = require('../../app/models/interest');
const nodemailer = require('nodemailer');
const utils = require('../../config/utils');
const moment = require('moment');

const authMiddleware = require('../../middlewares/auth');


const router = express.Router();

router.get('/mail/:_id',(req, res) => {
  //console.log('good thing');
  let id = req.params._id;
  //console.log('id: ' + id);
  Link.findOne({'user_dni' : id}, (err, link) => {
    //console.log(link);
    let dtnow = (moment().unix() - link.created) / 3600;
    console.log(dtnow);
    if (dtnow > 1.0) {
        return res.render('link_expired');
    } else {
      User.findByIdAndUpdate(id.split('&')[0], {'local.active' : 'true'}, (err, updated) => {
        if (err) return res.render('error', {error: 'Hubo un error mientras se activaba su usuario'})
        return res.render('users/login', {message: 'Su usuario esta activo, puede loguearse con su email y password'});//'El usuario ha sido activado, puede loguearse con su email y su password');
      })

    }
  });
});



module.exports = router;
