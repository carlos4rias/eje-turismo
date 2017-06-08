const app = require('./app');
const mongoose = require('mongoose');

const config = require('./config');

mongoose.connect(config.db, (err, res) => {
  if (err)
    return console.log(`Error al conectarse a la db ${err}`);

  console.log('Conexion a la db establecida');
  app.listen(config.port, () => {
    console.log(`app en el puerto: ${config.port}`);
  });
});
