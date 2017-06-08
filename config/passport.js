const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../app/models/user');
const Interest = require('../app/models/interest');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  },
  function(req, email, password, done) {
    process.nextTick(function() {
      User.findOne({ 'local.email' :  email }, function(err, user) {
        if (err)
            return done(err);
        if (!user)
          return done(null, false, req.flash('loginMessage', 'No hay usuario con ese email'));
        console.log(user);
        if (!user.local.active) return done(null, false, req.flash('loginMessage', 'El usuario no esta activo'));
        if (!user.validPassword(password))
          return done(null, false, req.flash('loginMessage', 'La contrase#a no coincide.'));
        else {
          return done(null, user);
        }
      });
    });

}));

passport.use('local-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  },
  function(req, email, password, done) {
    process.nextTick(function() {
      if (!req.user) {
        User.findOne({ 'local.email' :  email }, function(err, user) {
          if (err)
            return done(err);
          if (user) {
            return done(null, false, req.flash('signupMessage', 'Este email ya se encuentra registrado.'));
          } else {
            var interest = req.body.interest;

            if (!interest) {
              return done(null, false, req.flash('signupMessage', 'Debe escoger por lo menos un interes'));
            }
              var newUser = new User();

              newUser.local.email = email;
              newUser.local.password = newUser.generateHash(password);
              newUser.local.name = req.body.name;
              newUser.local.dni = req.body.dni;
              newUser.local.role = req.body.role;
              //newUser.local.active = true;
              newUser.local.phone = req.body.phone;
              newUser.local.city = req.body.city;
              newUser.local.country = req.body.country;

              newUser.save(function(err, data) {
                if (err)
                return done(err);

                if(typeof(interest) === 'string') {
                  var itmp = new Interest();
                  itmp.id_user = data._id;
                  itmp.name = interest;

                  itmp.save(function(err, data) {
                    if (err) return res.render('./error', {error: 'Intereses'});
                  });
                } else {
                  interest.forEach(function(inter) {
                    var itmp = new Interest();
                    itmp.id_user = data._id;
                    itmp.name = inter;

                    itmp.save(function(err, data) {
                      if (err) return res.render('./error', {error: 'Intereses'});
                    });
                });
              }
              return done(null, newUser);
            });
          }
      });
    } else {
      return done(null, req.user);
    }

  });

}));

module.exports = passport;
