const bcrypt = require('bcrypt');
const { User } = require('../models');

const seedUsers = async () => {
  try {
    // Hash password once for all users
    const defaultPassword = await bcrypt.hash('Password123', 10);

    // Single admin user with password field
    const adminData = {
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: defaultPassword, // Add password field
      role: 'admin',
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: adminData.email } });
    if (!existingAdmin) {
      const admin = await User.create(adminData);
    }

    // Generate dynamic timestamps
    const now = new Date();
    const timestamps = [
      // 10 users in last 24 hours
      ...Array(10).fill().map(() => new Date(now - Math.random() * 24 * 60 * 60 * 1000)),
      
      // 20 users in last 48 hours (24-48 hours ago)
      ...Array(20).fill().map(() => new Date(now - (24 + Math.random() * 24) * 60 * 60 * 1000)),
      
      // 15 users in last week (2-7 days ago)
      ...Array(15).fill().map(() => new Date(now - (2 + Math.random() * 5) * 24 * 60 * 60 * 1000)),
      
      // 10 users in last month (7-30 days ago)
      ...Array(10).fill().map(() => new Date(now - (7 + Math.random() * 23) * 24 * 60 * 60 * 1000)),
      
      // 5 users older than a month (30-90 days ago)
      ...Array(5).fill().map(() => new Date(now - (30 + Math.random() * 60) * 24 * 60 * 60 * 1000))
    ];

    // Shuffle timestamps for randomness
    for (let i = timestamps.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [timestamps[i], timestamps[j]] = [timestamps[j], timestamps[i]];
    }

    // Create 60 dummy users with dynamic timestamps
    const users = [];
    const indianNames = [
      'Arjun Kumar', 'Priya Sharma', 'Rahul Singh', 'Anita Patel', 'Vikram Reddy',
      'Sneha Gupta', 'Amit Joshi', 'Kavya Nair', 'Rohit Agarwal', 'Meera Iyer',
      'Sanjay Verma', 'Pooja Mishra', 'Karan Malhotra', 'Ritu Bansal', 'Ajay Yadav',
      'Deepika Rao', 'Manish Tiwari', 'Swati Chopra', 'Nikhil Saxena', 'Shweta Jain',
      'Rajesh Kumar', 'Neha Agrawal', 'Suresh Pandey', 'Kritika Sinha', 'Varun Kapoor',
      'Anjali Dubey', 'Harsh Goyal', 'Preeti Bhatt', 'Akash Mehta', 'Divya Khanna',
      'Manoj Singh', 'Richa Gupta', 'Abhishek Sharma', 'Nisha Arora', 'Gaurav Jain',
      'Simran Kaur', 'Ravi Prasad', 'Tanvi Shah', 'Mohit Agarwal', 'Shruti Verma',
      'Arun Kumar', 'Pallavi Reddy', 'Sachin Yadav', 'Aditi Malhotra', 'Vishal Tiwari',
      'Rashmi Patel', 'Naveen Gupta', 'Isha Sharma', 'Pankaj Singh', 'Komal Joshi',
      'Sunil Kumar', 'Madhuri Iyer', 'Ashish Bansal', 'Sunita Rao', 'Deepak Mishra',
      'Rekha Agrawal', 'Yogesh Pandey', 'Shilpa Sinha', 'Ramesh Kapoor', 'Geeta Dubey'
    ];

    for (let i = 0; i < 60; i++) {
      const randomName = indianNames[i] || `User ${i + 1}`;
      const emailPrefix = randomName.toLowerCase().replace(/\s+/g, '.');
      
      const userData = {
        name: randomName,
        email: `${emailPrefix}${i + 1}@example.com`,
        password: defaultPassword, // Add password field for all users
        role: 'user',
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 1}`,
        createdAt: timestamps[i] || new Date(now - Math.random() * 90 * 24 * 60 * 60 * 1000),
        updatedAt: timestamps[i] || new Date(now - Math.random() * 90 * 24 * 60 * 60 * 1000)
      };
      users.push(userData);
    }

    // Sort users by createdAt (newest first) for better visualization
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Bulk create users
    const createdUsers = await User.bulkCreate(users, {
      ignoreDuplicates: true,
      updateOnDuplicate: ['name', 'password', 'profileImage', 'createdAt', 'updatedAt']
    });


    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

seedUsers();




