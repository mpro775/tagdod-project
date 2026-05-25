const path = require('path');
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://bthwani1_db_user:WTmCFUDVVGOTeMHc@cluster0.vip178l.mongodb.net/tagadodo?retryWrites=true&w=majority&appName=Cluster0';

async function check() {
  console.log('Connecting to Atlas...');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');
    
    const db = mongoose.connection.db;
    const profiles = await db.collection('engineerprofiles').find({}).toArray();
    console.log('Total profiles found:', profiles.length);
    
    for (const p of profiles) {
      // Find user name
      const user = await db.collection('users').findOne({ _id: p.userId });
      const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown';
      console.log(`Profile Name: ${name}`);
      console.log(`- userId: ${p.userId}`);
      console.log(`- avatarUrl: ${p.avatarUrl}`);
      console.log(`- jobTitle: ${p.jobTitle}`);
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

check();
