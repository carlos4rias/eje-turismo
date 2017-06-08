


module.exports = {
  port: process.env.PORT || 3000,
  db: process.env.MONGOLAB_URI || 'mongodb://localhost/eje-turismo',
  link_web : function() {
    if (process.env.PORT) return 'https://ejeturismo.herokuapp.com/';
    else return 'http://localhost:3000/'
  }
}
