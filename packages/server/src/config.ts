export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export const config = {
  dbCredentials: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'test_flow_form'
  } as DbConfig
};
