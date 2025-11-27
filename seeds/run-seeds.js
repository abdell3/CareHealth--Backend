require('dotenv').config();
const seedAdmin = require('./seed-admin');
const seedRolesUsers = require('./seed-roles-users');
const seedDemoData = require('./seed-demoData');

const runSeeds = async () => {
  try {
    console.log('========================================');
    console.log('  CareHealth EHR - Database Seeding');
    console.log('========================================\n');

    console.log('Running seed 1/3: Admin');
    console.log('----------------------------------------');
    await seedAdmin();
    console.log('');

    console.log('Running seed 2/3: Roles & Users');
    console.log('----------------------------------------');
    await seedRolesUsers();
    console.log('');

    console.log('Running seed 3/3: Demo Data');
    console.log('----------------------------------------');
    await seedDemoData();
    console.log('');

    console.log('========================================');
    console.log('✓ All seeds completed successfully!');
    console.log('========================================');
    process.exit(0);
  } catch (error) {
    console.error('\n========================================');
    console.error('✗ Seeding failed:', error.message);
    console.error('========================================');
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
};

runSeeds();

