const prompt = require('prompt');
const mongoose = require('mongoose');

const User = require('./app/models/user');

const config = require('./config');

mongoose.connect(config.db, (err, res) => {
  if (err)
  return console.log(`Error al conectarse a la db ${err}`);
  console.log('Conexion a la db establecida');

  User.findOne({'local.role': 'root'}, (err, user) => {
    if (err) {console.log('Hubo un error'); process.exit();}
    if (user) {console.log('Ya hay un usuario root creado :)'); process.exit();}
    else {

      prompt.start();

      prompt.get(['email', 'password'], (err, result) => {
        if (!result.email) {
          console.log('Debe ingresar un email'); process.exit();
        }
        if (!result.password) {
          console.log('Debe ingresar un password'); process.exit();
        }
        let user = new User();
        user.local.email = result.email;
        user.local.password = user.generateHash(result.password);
        user.local.name = 'root';
        user.local.dni = '10000000';
        user.local.role = 'root';
        user.local.active = true;
        user.local.phone = '31123132';
        user.local.city = 'Pereira';
        user.local.country = 'Colombia';

        user.save(function(err, data) {
          if (err) {console.log(err); process.exit();}
          console.log(`Usuario root creado:
            \nemail: ${result.email}
            \npassword: ${result.password}`
          );
          process.exit();
        });
      });
    }
  });

});
