require('dotenv').config();
const bcrypt = require('bcrypt');
const { initializeDatabase, closeDatabase } = require('../config/database');
const User = require('../app/Models/User');
const Role = require('../app/Models/Role');

const seedRolesUsers = async () => {
  try {
    await initializeDatabase();
    console.log('✓ Database connected');

    const roles = ['doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician'];
    const roleIds = {};

    for (const roleName of roles) {
      let role = await Role.findOne({ name: roleName });
      if (!role) {
        role = await Role.create({ name: roleName });
        console.log(`✓ ${roleName} role created:`, role._id.toString());
      } else {
        console.log(`✓ ${roleName} role exists:`, role._id.toString());
      }
      roleIds[roleName] = role._id;
    }

    const usersData = [
      {
        firstName: 'John',
        lastName: 'Doctor',
        email: 'doctor@careflow.com',
        phone: '+1234567891',
        roleName: 'doctor'
      },
      {
        firstName: 'Jane',
        lastName: 'Nurse',
        email: 'nurse@careflow.com',
        phone: '+1234567892',
        roleName: 'nurse'
      },
      {
        firstName: 'Bob',
        lastName: 'Receptionist',
        email: 'receptionist@careflow.com',
        phone: '+1234567893',
        roleName: 'receptionist'
      },
      {
        firstName: 'Alice',
        lastName: 'Pharmacist',
        email: 'pharmacist@careflow.com',
        phone: '+1234567894',
        roleName: 'pharmacist'
      },
      {
        firstName: 'Charlie',
        lastName: 'LabTech',
        email: 'labtech@careflow.com',
        phone: '+1234567895',
        roleName: 'lab_technician'
      }
    ];

    const createdUsers = {};
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    for (const userData of usersData) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⚠ ${userData.roleName} user already exists:`, existingUser._id.toString());
        createdUsers[userData.roleName] = existingUser._id.toString();
        continue;
      }

      const user = await User.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        role: roleIds[userData.roleName],
        isActive: true,
        isSuspended: false
      });

      console.log(`✓ ${userData.roleName} user created:`, user._id.toString());
      createdUsers[userData.roleName] = user._id.toString();
    }

    console.log('\n✓ All users created:');
    Object.keys(createdUsers).forEach(role => {
      console.log(`  ${role}: ${createdUsers[role]}`);
    });

    await closeDatabase();
    return createdUsers;
  } catch (error) {
    console.error('✗ Error seeding roles and users:', error.message);
    if (error.code === 11000) {
      console.error('  Duplicate key error - user may already exist');
    }
    await closeDatabase();
    throw error;
  }
};

if (require.main === module) {
  seedRolesUsers()
    .then((users) => {
      console.log('\n✓ Seed roles and users completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Seed roles and users failed:', error);
      process.exit(1);
    });
}

module.exports = seedRolesUsers;

