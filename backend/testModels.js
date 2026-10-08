// testModels.js
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

connectDB().then(() => {
  console.log('Models loaded without errors!');
  console.log(User.modelName);
  process.exit();
});