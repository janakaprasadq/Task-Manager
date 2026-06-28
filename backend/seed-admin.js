const db = require('./db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  try {
    const name = 'System Admin';
    const email = 'admin@taskmanager.com';
    const password = 'adminpassword123'; // Default secure password
    
    // Check if user already exists
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      // If user exists, promote to Admin
      await db.query('UPDATE users SET role = "Admin" WHERE email = ?', [email]);
      console.log(`User ${email} promoted to Admin successfully!`);
    } else {
      // Create new Admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "Admin")',
        [name, email, hashedPassword]
      );
      console.log(`Admin account created successfully!`);
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
    }
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
