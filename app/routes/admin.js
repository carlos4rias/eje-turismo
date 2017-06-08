const express = require('express');
const nodemailer = require('nodemailer');
const moment = require('moment');


const admin = express.Router();

const User = require('../../app/models/user');
const Link = require('../../app/models/activation_link');
const Interest = require('../../app/models/interest');
const Marker = require('../../app/models/marker');

const utils = require('../../config/utils');

const config = require('../../config');

const authMiddleware = require('../../middlewares/auth');


admin.get('/', authMiddleware.isLoggedIn, authMiddleware.isAdmin, (req, res) => {
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

    console.log(req.user);
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
        return res.render('admin', {user: user, suscribers: data});
      }
   );
  })
});

admin.get('/activation/:_id', authMiddleware.isLoggedIn, authMiddleware.isAdmin, (req, res) => {
  //console.log(req.params._id);
  let link = new Link();
  link.user_dni = req.params._id + '&' + link._id + link.created;

  link.save((err, linkStored) => {
    //console.log('saved');
    if (err) return res.render('/admin');
    User.findOne({'_id' : req.params._id}, (err, user) => {
      if (err) return res.render('/admin');
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
        return res.redirect('/admin');
      });


      //console.log(link);
    });
  });
});

admin.get('/deactivation/:_id', authMiddleware.isLoggedIn, authMiddleware.isAdmin, (req, res) => {
  let id = req.params._id;
  User.findByIdAndUpdate(id, {'local.active' : 'false'}, (err, updated) => {
    if (err) return res.render('error', {error: 'Hubo un error mientras se activaba su usuario'})
    return res.redirect('/admin');
  });
});

admin.get('/modify_sus/:_id', authMiddleware.isLoggedIn, authMiddleware.isAdmin, (req, res) => {
  let id = req.params._id;
  User.findOne({'_id': id}, (err, user) => {
    if (err) return res.render('admin/index', {message : 'hubo un error mientras se cargaba la informacion'});
    //console.log(user);
    let payload = {
      id: user._id,
      name: user.local.name,
      dni: user.local.dni,
      country: user.local.country,
      city: user.local.city,
      phone: user.local.phone,
    }
    return res.render('admin/modify_sus', {user: req.user, usersus: payload});
  });
});

admin.post('/modify_sus/:_id', authMiddleware.isLoggedIn, authMiddleware.isAdmin, (req, res) => {
  let id = req.params._id;

  let info = {
    'local.name' : req.body.name,
    'local.dni' : req.body.dni,
    'local.country' : req.body.country,
    'local.city' : req.body.city,
    'local.phone' : req.body.phone,
  };

  User.findByIdAndUpdate(id, info, (err, user) => {
    if (err) return res.redirect('/admin');
    console.log(user);
    return res.redirect('/admin');
  })
});

admin.get('/profile', authMiddleware.isLoggedIn, authMiddleware.isAdmin, (req, res) => {
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
    return res.render('admin/profile', {user: req.user, usersus: payload});
  });
});

admin.post('/profile', authMiddleware.isLoggedIn, authMiddleware.isAdmin, (req, res) => {
  let id = req.user._id;

  let info = {
    'local.name' : req.body.name,
    'local.dni' : req.body.dni,
    'local.country' : req.body.country,
    'local.city' : req.body.city,
    'local.phone' : req.body.phone,
  };

  User.findByIdAndUpdate(id, info, (err, user) => {
    if (err) return res.redirect('/admin');
    console.log(user);
    return res.redirect('/admin');
  });
});

admin.get('/map', authMiddleware.isLoggedIn, authMiddleware.isAdmin, (req, res) => {
  let payload = {};
  let id = req.user._id;

  Interest.find({'id_user': id}, (err, interests) => {
    if (err) return res.redirect('/admin');
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
  let name = req.body.type;
  console.log(mymarker);

  mymarker.save((err) => {
    file.mv('./public/media/' + filename, (err) => {
      Interest.find({'name': name}, (err, data) => {
        //console.log(data);
        let ids = data.map((x) => x.id_user);
        User.find({}, (err, users) => {
          let emails = [];
          for (let it = 0; it < users.length; it++) {
            if(ids.indexOf(users[it]._id.toString()) !== -1) {
              if (users[it].local.role !== 'suscriber' || users[it].local.active === false) continue;
              emails.push(users[it].local.email);
            }
          }
          console.log(emails);
          let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: utils.email,
              pass: utils.epass
            }
          });

          let html = '<h2>Nuevo contenido en ' + name + ' que te podria interesar</h2>';
          html += '<h3>'+ req.body.name + '</h3>'
          html += '<p>'+ req.body.description + '</p><hr>'
          html += 'visita nuestra pagina para ver mas ' + config.link_web();
          console.log(html);

          let mailOptions = {
            from: '"EJE turismo" <ejeturismo@gmail.com>',
            to: emails,
            subject: 'Nuevo contenido ✔',
            text: 'Saludos',
            html: html
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) return res.render('error');
            //console.log('Message %s sent: %s', info.messageId, info.response);
            return res.redirect('/admin/map');
          });
        });
      });
    });
  });
});

/*
admin.get('/test/:_id', (req, res) => {
  let name = req.params._id;
})
*/

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

module.exports = admin;
