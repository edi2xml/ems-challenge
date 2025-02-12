

DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS timesheets;


CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    job_title TEXT NOT NULL,
    department TEXT NOT NULL,
    salary INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    photo_path TEXT, 
    cv_path TEXT, 
    id_document_path TEXT 
    
);


CREATE TABLE timesheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    employee_id INTEGER NOT NULL,
    summary TEXT NOT NULL, 
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
