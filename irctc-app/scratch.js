import mongoose from 'mongoose';
import Train from './server/models/train.js';
import TrainRoute from './server/models/trainRoute.js';

const uri = "mongodb+srv://irctc:irctc123@cluster0.b0g4d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // From the user's .env

const run = async () => {
  await mongoose.connect(uri);
  const trains = await Train.find({}).lean();
  const routes = await TrainRoute.find({}).sort({ stationOrder: 1 }).lean();
  console.log("Trains Count:", trains.length);
  console.log("Routes Count:", routes.length);
  
  const joined = trains.map(t => {
    t.route = routes.filter(r => r.train.toString() === t._id.toString());
    return t;
  });

  console.log("First train route:", JSON.stringify(joined[0]?.route, null, 2));
  console.log("Last train route:", JSON.stringify(joined[joined.length - 1]?.route, null, 2));

  await mongoose.disconnect();
};

run().catch(console.dir);
