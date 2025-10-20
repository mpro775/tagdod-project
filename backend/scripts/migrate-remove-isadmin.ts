// Migration script to remove conflicting isAdmin field from users collection
// Run this script to clean up the database after fixing the naming conflict

import { connect, connection } from 'mongoose';

async function migrateUsers() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://bthwani1_db_user:WTmCFUDVVGOTeMHc@cluster0.vip178l.mongodb.net/tagadodo?retryWrites=true&w=majority&appName=Cluster0";
    await connect(mongoUri);

    const db = connection.db;
    const usersCollection = db.collection('users');

    console.log('Starting migration to remove isAdmin field conflicts...');

    // Step 1: Add admin role to users who have isAdmin: true but don't have admin role
    const usersWithIsAdmin = await usersCollection.find({
      isAdmin: true,
      roles: { $ne: 'admin' }
    }).toArray();

    if (usersWithIsAdmin.length > 0) {
      console.log(`Found ${usersWithIsAdmin.length} users with isAdmin: true but no admin role`);

      for (const user of usersWithIsAdmin) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $addToSet: { roles: 'admin' } }
        );
      }

      console.log('Added admin role to users with isAdmin: true');
    }

    // Step 2: Add super_admin role to users who have isAdmin: true but don't have super_admin role
    const usersWithIsAdminNoSuper = await usersCollection.find({
      isAdmin: true,
      roles: { $ne: 'super_admin' }
    }).toArray();

    if (usersWithIsAdminNoSuper.length > 0) {
      console.log(`Found ${usersWithIsAdminNoSuper.length} users with isAdmin: true but no super_admin role`);

      for (const user of usersWithIsAdminNoSuper) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $addToSet: { roles: 'super_admin' } }
        );
      }

      console.log('Added super_admin role to users with isAdmin: true');
    }

    // Step 3: Remove the isAdmin field from all users
    const result = await usersCollection.updateMany(
      { isAdmin: { $exists: true } },
      { $unset: { isAdmin: '' } }
    );

    console.log(`Removed isAdmin field from ${result.modifiedCount} users`);

    // Step 4: Verify the migration
    const usersWithIsAdminAfter = await usersCollection.find({
      isAdmin: { $exists: true }
    }).toArray();

    if (usersWithIsAdminAfter.length === 0) {
      console.log('✅ Migration completed successfully! No users have isAdmin field anymore.');
    } else {
      console.log(`⚠️ Warning: ${usersWithIsAdminAfter.length} users still have isAdmin field`);
    }

    // Show sample of migrated users
    const sampleUsers = await usersCollection.find({
      roles: { $in: ['admin', 'super_admin'] }
    }).limit(3).toArray();

    console.log('Sample of admin users after migration:');
    sampleUsers.forEach(user => {
      console.log(`- ${user.phone}: roles=${user.roles?.join(',') || 'none'}`);
    });

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.close();
  }
}

// Run the migration
migrateUsers().catch(console.error);
