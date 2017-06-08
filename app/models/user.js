const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');


const userSchema = mongoose.Schema({
    local : {
      email: {type: String, unique: true, lowercase: true},
      name: String,
      password: {type: String, selectable:false},
      signupDate: {type: Date, default: Date.now()},
      lastLogin: Date,
      dni: {type: String, required: true},
      country: String,
      city: String,
      phone: String,
      role: {type: String, required: true, enum: ['root','admin','suscriber'], default: 'suscriber'},
      active: {type: Boolean, default: false}
    }
});


userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
