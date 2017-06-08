const express = require('express');
const nodemailer = require('nodemailer');
const moment = require('moment');

const suscriber = express.Router();

const User = require('../../app/models/user');
const Interest = require('../../app/models/interest');
const Marker = require('../../app/models/marker');

const utils = require('../../config/utils');

const config = require('../../config');

const authMiddleware = require('../../middlewares/auth');


suscriber.get('/map', authMiddleware.isLoggedIn, authMiddleware.isSuscriber, (req, res) => {
  let id = req.user._id;
  let user = {
    email : req.user.local.email,
    name : req.user.local.name,
    dni : req.user.local.dni,
    phone : req.user.local.phone,
    city : req.user.local.city,
    country: req.user.local.country
  }

  Interest.find({'id_user': id}, (err, datai) => {
    if (err) return cb(err);
    user.interests = datai.map((x) => x.name);
    req.user.interests = user.interests;
    urlimg = config.link_web();
    console.log(req.user);
    Marker.find({}, (err, markers) => {
      console.log(markers);
      markers = JSON.stringify(markers);
      return res.render('suscriber/map', {markers, user, urlimg});
    })
  })
});

suscriber.get('/profile', authMiddleware.isLoggedIn, authMiddleware.isSuscriber, (req, res) => {
  let id = req.user._id;
  User.findOne({'_id': id}, (err, user) => {
    //if (err) return res.render('admin/index', {message : 'hubo un error mientras se cargaba la informacion'});
    console.log(user);
    let payload = {
      id: user._id,
      name: user.local.name,
      dni: user.local.dni,
      country: user.local.country,
      city: user.local.city,
      phone: user.local.phone,
    }
    return res.render('suscriber/profile', {user: req.user, usersus: payload});
  });
});

suscriber.post('/profile', authMiddleware.isLoggedIn, authMiddleware.isSuscriber, (req, res) => {
  let id = req.user._id;

  let info = {
    'local.name' : req.body.name,
    'local.dni' : req.body.dni,
    'local.country' : req.body.country,
    'local.city' : req.body.city,
    'local.phone' : req.body.phone,
  };

  User.findByIdAndUpdate(id, info, (err, user) => {
    if (err) return res.redirect('/suscriber/map');
    console.log(user);
    return res.redirect('/suscriber/map');
  });
});
/*
admin.get('/map', authMiddleware.isLoggedIn, authMiddleware.isAdmin, (req, res) => {
  let payload = {};
  let id = req.user._id;

  Interest.find({'id_user': id}, (err, interests) => {
    if (err) return redirect('/admin');
    payload.interests = interests.map((x) => x.name);

    Marker.find({author : id}, (err, data) => {
      if (err) return redirect('/admin/suscribers');
      payload.markers = JSON.stringify(data);
      payload.urlimg = config.link_web();
      return res.render('admin/map', {payload});
    });

  });
});

admin.post('/map', authMiddleware.isLoggedIn, authMiddleware.isAdmin, (req, res) => {

  let id = req.user._id;
  let mymarker = new Marker(req.body);
  mymarker.author = id;
  let file = req.files.media;
  let filename = req.files.media.name;
  mymarker.namemedia = filename;

  //console.log(mymarker);

  mymarker.save((err) => {
    console.log(err);
    file.mv('./public/media/' + filename, (err) => {
      return res.redirect('/admin/map');
    });
  });
});

admin.post('/map/update', authMiddleware.isLoggedIn, authMiddleware.isAdmin, (req, res) => {
  console.log(req.body);
  let payload = {
    name: req.body.name_up,
    lat: req.body.lat_up,
    lon: req.body.lon_up,
    description: req.body.description_up,
    type: req.body.type_up,
    active: req.body.active
  }
  Marker.findByIdAndUpdate(req.body.marker_id, payload, (err, marker) => {
    console.log(marker)
    return res.redirect('/admin/map')
  })
});
*/
module.exports = suscriber;
