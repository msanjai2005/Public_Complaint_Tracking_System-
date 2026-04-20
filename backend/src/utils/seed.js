require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Complaint = require('../models/Complaint');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Complaint.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@complaint.com',
      phone: '9999999999',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      address: {
        street: '123 Admin St',
        city: 'Mumbai',
        pincode: '400001',
        landmark: 'Near City Hall',
      },
    });
    console.log('✅ Admin created: admin@complaint.com / admin123');

    // Create staff user
    const staff = await User.create({
      name: 'Staff Member',
      email: 'staff@complaint.com',
      phone: '8888888888',
      password: 'staff123',
      role: 'staff',
      isVerified: true,
      address: {
        street: '456 Staff Ave',
        city: 'Mumbai',
        pincode: '400002',
        landmark: 'Near Park',
      },
    });
    console.log('✅ Staff created: staff@complaint.com / staff123');

    // Create regular users
    const user1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@test.com',
      phone: '7777777777',
      password: 'user123',
      role: 'user',
      isVerified: true,
      address: {
        street: '789 User Lane',
        city: 'Delhi',
        pincode: '110001',
        landmark: 'Near Metro Station',
      },
    });

    const user2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@test.com',
      phone: '6666666666',
      password: 'user123',
      role: 'user',
      isVerified: true,
      address: {
        street: '101 Citizen Rd',
        city: 'Bangalore',
        pincode: '560001',
        landmark: 'Near Market',
      },
    });
    console.log('✅ Test users created');

    // Create categories
    const categories = await Category.insertMany([
      { name: 'Garbage Collection', description: 'Issues related to garbage and waste management', department: 'Sanitation', slaHours: 24, icon: '🗑️' },
      { name: 'Drainage', description: 'Blocked drains, sewage overflow', department: 'Public Works', slaHours: 48, icon: '🚿' },
      { name: 'Streetlight', description: 'Non-functional or damaged streetlights', department: 'Electrical', slaHours: 72, icon: '💡' },
      { name: 'Road Damage', description: 'Potholes, broken roads, footpath damage', department: 'Public Works', slaHours: 96, icon: '🛣️' },
      { name: 'Water Supply', description: 'No water, contaminated water, leakage', department: 'Water Board', slaHours: 24, icon: '💧' },
      { name: 'Sewage', description: 'Sewage problems and sanitation issues', department: 'Sanitation', slaHours: 48, icon: '🚽' },
      { name: 'Others', description: 'Other civic complaints', department: 'General', slaHours: 72, icon: '📋' },
    ]);
    console.log('✅ Categories created');

    // Create sample complaints
    const sampleComplaints = [
      {
        title: 'Garbage not collected for 3 days',
        description: 'The garbage in our locality has not been collected for the past 3 days. The bins are overflowing and it is causing health hazards.',
        category: categories[0]._id,
        user: user1._id,
        priority: 'high',
        status: 'pending',
        department: 'Sanitation',
        location: { address: 'Sector 14, Noida, UP 201301' },
      },
      {
        title: 'Blocked drainage causing water logging',
        description: 'The main drainage near Block B is completely blocked causing severe water logging during rains. Mosquitoes breeding rapidly.',
        category: categories[1]._id,
        user: user1._id,
        priority: 'high',
        status: 'under-review',
        department: 'Public Works',
        location: { address: 'Block B, Dwarka Sector 7, Delhi 110077' },
      },
      {
        title: 'Streetlight not working on Main Road',
        description: 'The streetlight near the main junction has been non-functional for a week. The area is very dark at night and unsafe for pedestrians.',
        category: categories[2]._id,
        user: user2._id,
        priority: 'medium',
        status: 'in-progress',
        assignedTo: staff._id,
        department: 'Electrical',
        location: { address: 'MG Road, Bangalore 560001' },
      },
      {
        title: 'Large pothole on highway connecting road',
        description: 'There is a large pothole on the connecting road near flyover. Multiple accidents have occurred. Immediate attention needed for road repair.',
        category: categories[3]._id,
        user: user2._id,
        priority: 'high',
        status: 'resolved',
        assignedTo: staff._id,
        department: 'Public Works',
        resolvedAt: new Date(),
        resolutionTime: 36,
        location: { address: 'National Highway 44, Near Flyover, Hyderabad' },
      },
      {
        title: 'No water supply for 2 days',
        description: 'Our area has not received water supply for the past 2 days. This is causing severe inconvenience to all residents in the colony.',
        category: categories[4]._id,
        user: user1._id,
        priority: 'high',
        status: 'in-progress',
        department: 'Water Board',
        location: { address: 'Andheri East, Mumbai 400069' },
      },
      {
        title: 'Sewage overflow in residential area',
        description: 'Sewage is overflowing from the manhole near the park. The stench is unbearable and it is a major health risk for the children playing nearby.',
        category: categories[5]._id,
        user: user2._id,
        priority: 'medium',
        status: 'pending',
        department: 'Sanitation',
        location: { address: 'Green Park, Sector 21, Gurgaon 122018' },
      },
    ];

    for (const data of sampleComplaints) {
      const complaint = new Complaint({
        ...data,
        complaintId: `SWC-${new Date().getFullYear()}${String(sampleComplaints.indexOf(data) + 1).padStart(4, '0')}`,
        timeline: [
          {
            status: 'pending',
            comment: 'Complaint registered successfully',
            updatedBy: data.user,
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        ],
      });

      // Add more timeline entries based on status
      if (['under-review', 'in-progress', 'resolved'].includes(data.status)) {
        complaint.timeline.push({
          status: 'under-review',
          comment: 'Complaint is being reviewed by the department',
          updatedBy: admin._id,
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        });
      }
      if (['in-progress', 'resolved'].includes(data.status)) {
        complaint.timeline.push({
          status: 'in-progress',
          comment: 'Work has been initiated to resolve the issue',
          updatedBy: staff._id,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        });
      }
      if (data.status === 'resolved') {
        complaint.timeline.push({
          status: 'resolved',
          comment: 'Issue has been resolved successfully',
          updatedBy: staff._id,
          timestamp: new Date(),
        });
      }

      await complaint.save({ validateBeforeSave: false });
    }
    console.log('✅ Sample complaints created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@complaint.com / admin123');
    console.log('   Staff: staff@complaint.com / staff123');
    console.log('   User1: rahul@test.com / user123');
    console.log('   User2: priya@test.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
