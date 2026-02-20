const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://n0502898789:Nahla%3F%3F123@cluster0.jvrnjss.mongodb.net/modular_skills?retryWrites=true&w=majority';

mongoose.connect(mongoUri)
.then(() => {
  console.log('✅ MongoDB connected successfully!');
  mongoose.connection.close();
})
.catch(err => {
  console.error('❌ MongoDB connection failed:');
  console.error(err.message);
});
