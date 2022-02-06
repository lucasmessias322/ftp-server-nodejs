const mongoose = require('mongoose')

const AdminUser = mongoose.model('AdminUser', {
  name: String,
  email: String,
  password: String
})

module.exports = AdminUser
