import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfigPath = path.join(__dirname, '../database.yaml');
const dbConfig = yaml.load(fs.readFileSync(dbConfigPath, 'utf8'));

const {
  'sqlite_path': sqlitePath,
} = dbConfig;

const db = new sqlite3.Database(sqlitePath);

const employees = [
  {
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@company.com",
    phone_number: "+1-555-123-4567",
    date_of_birth: "1990-05-15",
    job_title: "Software Engineer",
    department: "Engineering",
    salary: 85000.0,
    start_date: "2024-01-15",
    end_date: null,
    photo_path: null,
  },
  {
    first_name: "Jane",
    last_name: "Smith",
    email: "jane.smith@company.com",
    phone_number: "+1-555-234-5678",
    date_of_birth: "1988-08-22",
    job_title: "Product Manager",
    department: "Product",
    salary: 95000.0,
    start_date: "2023-11-01",
    end_date: null,
    photo_path: null,
  },
  {
    first_name: "Alice",
    last_name: "Johnson",
    email: "alice.johnson@company.com",
    phone_number: "+1-555-345-6789",
    date_of_birth: "1992-03-10",
    job_title: "UX Designer",
    department: "Design",
    salary: 78000.0,
    start_date: "2024-02-01",
    end_date: null,
    photo_path: null,
  },
];


const timesheets = [
  {
    employee_id: 1,
    start_time: "2025-02-10 08:00:00",
    end_time: "2025-02-10 17:00:00",
    summary: "Implemented new user authentication feature",
  },
  {
    employee_id: 2,
    start_time: "2025-02-11 12:00:00",
    end_time: "2025-02-11 17:00:00",
    summary: "Product roadmap planning and stakeholder meetings",
  },
  {
    employee_id: 3,
    start_time: "2025-02-12 07:00:00",
    end_time: "2025-02-12 16:00:00",
    summary: "Redesigned mobile app navigation flow",
  },
];


const insertData = (table, data) => {
  const columns = Object.keys(data[0]).join(', ');
  const placeholders = Object.keys(data[0]).map(() => '?').join(', ');

  const insertStmt = db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`);

  data.forEach(row => {
    insertStmt.run(Object.values(row));
  });

  insertStmt.finalize();
};

db.serialize(() => {
  insertData('employees', employees);
  insertData('timesheets', timesheets);
});

db.close(err => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Database seeded successfully.');
  }
});

