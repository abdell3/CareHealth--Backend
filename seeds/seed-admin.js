require('dotenv').config();
const bcrypt = require('bcrypt');
const { initializeDatabase, closeDatabase } = require('../config/database');
const User = require('../app/Models/User');
const Role = require('../app/Models/Role');

const seedAdmin = async () => {
  try {
    await initializeDatabase();
    console.log('✓ Database connected');

    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      adminRole = await Role.create({ name: 'admin' });
      console.log('✓ Admin role created:', adminRole._id.toString());
    } else {
      console.log('✓ Admin role exists:', adminRole._id.toString());
    }

    const existingAdmin = await User.findOne({ email: 'admin@carehealth.com' });
    if (existingAdmin) {
      console.log('⚠ Admin user already exists:', existingAdmin._id.toString());
      await closeDatabase();
      return existingAdmin._id.toString();
    }

    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    const admin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@carehealth.com',
      password: hashedPassword,
      phone: '+1234567890',
      role: adminRole._id,
      isActive: true,
      isSuspended: false
    });

    console.log('✓ Admin user created successfully');
    console.log('  ID:', admin._id.toString());
    console.log('  Email:', admin.email);
    console.log('  Role:', adminRole.name);

    await closeDatabase();
    return admin._id.toString();
  } catch (error) {
    console.error('✗ Error seeding admin:', error.message);
    if (error.code === 11000) {
      console.error('  Duplicate key error - admin may already exist');
    }
    await closeDatabase();
    throw error;
  }
};

if (require.main === module) {
  seedAdmin()
    .then((adminId) => {
      console.log('\n✓ Seed admin completed. Admin ID:', adminId);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Seed admin failed:', error);
      process.exit(1);
    });
}

module.exports = seedAdmin;

