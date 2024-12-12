import { mysqlTable, int, varchar, text, timestamp } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 50 }).notNull(),
  password: varchar('password', { length: 128 }).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const formSpecs = mysqlTable('form_specs', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 128 }).notNull(),
  formConfig: text('form_config').notNull(),
  flowConfig: text('flow_config').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const formInstances = mysqlTable('form_instances', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id),
  formSpecId: int('form_spec_id').notNull().references(() => formSpecs.id),
  currentStatus: varchar('current_status', { length: 128 }).notNull(),
  formData: text('form_data').notNull(),
  flowRemark: text('flow_remark'),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  createdAt: timestamp('created_at').defaultNow(),
});
