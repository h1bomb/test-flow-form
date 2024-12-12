import { Connection } from 'mysql2/promise';

export async function resetDatabase(connection: Connection) {
  try {
    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Truncate all tables in the correct order
    await connection.query('TRUNCATE TABLE form_instances');
    await connection.query('TRUNCATE TABLE form_specs');
    await connection.query('TRUNCATE TABLE users');

    // Reset auto-increment counters
    await connection.query('ALTER TABLE form_instances AUTO_INCREMENT = 1');
    await connection.query('ALTER TABLE form_specs AUTO_INCREMENT = 1');
    await connection.query('ALTER TABLE users AUTO_INCREMENT = 1');

    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}
