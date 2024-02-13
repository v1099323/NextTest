const { createClient } = require('@vercel/postgres');
const {
  invoices,
  customers,
  revenue,
  users,
} = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');

async function seedUsers(client) {
  try {
    // Create the "users" table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);

    console.log(`Created "users" table`);

    // Insert data into the "users" table
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return client.query(`
          INSERT INTO users (id, name, email, password)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (id) DO NOTHING;
        `, [user.id, user.name, user.email, hashedPassword]);
      }),
    );

    console.log(`Seeded ${insertedUsers.length} users`);

    return {
      users: insertedUsers,
    };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

// По аналогии добавьте функции seedInvoices, seedCustomers, seedRevenue

async function main() {
  const client = createClient(); // Создание нового клиента

  try {
    await client.connect(); // Подключение к базе данных

    // Здесь вызываем функции для заполнения базы данных
    await seedUsers(client);
    // Добавьте вызовы других функций для заполнения других таблиц

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('An error occurred while attempting to seed the database:', error);
  } finally {
    await client.end(); // Закрытие соединения с базой данных
  }
}

main();
