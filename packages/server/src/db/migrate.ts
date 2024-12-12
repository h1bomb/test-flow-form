import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';

async function runMigrations() {
  // Database connection configuration
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'test_flow_form',
    multipleStatements: true,
  });

  const db = drizzle(connection);

  // Run migrations
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations completed!');

  await connection.end();
}

// Run migrations and handle any errors
runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
