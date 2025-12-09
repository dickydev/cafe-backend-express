const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Seed Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await client.query(`
      INSERT INTO users (email, password, full_name, phone, role, is_verified) VALUES
      ('admin@cafelab.com', $1, 'Admin User', '081234567890', 'admin', true),
      ('staff@cafelab.com', $1, 'Staff Member', '081234567891', 'staff', true),
      ('customer@example.com', $1, 'John Doe', '081234567892', 'customer', true)
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    // Seed Categories
    await client.query(`
      INSERT INTO categories (name, description, display_order) VALUES
      ('Coffee', 'Hot and cold coffee beverages', 1),
      ('Tea', 'Various types of tea', 2),
      ('Food', 'Delicious food items', 3),
      ('Desserts', 'Sweet treats', 4)
      ON CONFLICT DO NOTHING
    `);

    // Seed Products
    await client.query(`
      INSERT INTO products (category_id, name, description, price, is_available, is_featured, stock_quantity) VALUES
      (1, 'Espresso', 'Strong espresso shot', 25000, true, true, 100),
      (1, 'Cappuccino', 'Espresso with steamed milk', 35000, true, true, 100),
      (1, 'Latte', 'Smooth espresso with milk', 38000, true, false, 100),
      (2, 'Green Tea', 'Premium green tea', 22000, true, false, 100),
      (3, 'Croissant', 'Buttery pastry', 28000, true, true, 50),
      (3, 'Sandwich', 'Club sandwich', 45000, true, false, 30),
      (4, 'Cheesecake', 'NY style cheesecake', 35000, true, true, 20)
      ON CONFLICT DO NOTHING
    `);

    // Seed Tables
    await client.query(`
      INSERT INTO tables (table_number, capacity, location, status) VALUES
      ('T01', 2, 'Indoor', 'available'),
      ('T02', 2, 'Indoor', 'available'),
      ('T03', 4, 'Indoor', 'available'),
      ('T04', 4, 'Indoor', 'available'),
      ('T05', 6, 'Indoor', 'available')
      ON CONFLICT (table_number) DO NOTHING
    `);

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
};

const seed = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    await seedData();
    console.log('✅ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seed();
}

module.exports = { seedData };
