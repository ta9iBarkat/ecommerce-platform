// config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Add the useFindAndModify option here
    mongoose.set('useFindAndModify', false); // This is the line to add

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true, // You might have this one too
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;