import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';
import config from '../../drizzle.config';

async function runMigrations() {
  // Database connection configuration using drizzle config
  const connection = await mysql.createConnection({
    ...config.dbCredentials,
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
