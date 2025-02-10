import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { useLoaderData } from "react-router-dom";
import { getDB } from "~/db/getDB";
import { Link, Form, useActionData } from "react-router-dom";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Path where images will be saved (inside 'public/uploads' for Vite)
const uploadDir = path.join(process.cwd(), "public", "uploads");


export async function loader() {
  const db = await getDB();
  const departments = await db.all("SELECT DISTINCT department FROM employees");
  return { departments: departments.map((d) => d.department) };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const employee = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email"),
    phone_number: formData.get("phone_number"),
    date_of_birth: formData.get("date_of_birth"),
    job_title: formData.get("job_title"),
    department: formData.get("department"),
    salary: formData.get("salary"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date") || null,
    photo: formData.get("photo_path"), // Handle the uploaded file
  };


  // Age validation
  const today = new Date();
  const birthDate = new Date(employee.date_of_birth as string);
  const age = today.getFullYear() - birthDate.getFullYear();
  const isAdult = age >= 18;
  if (!isAdult) {
    return { error: "Employee must be at least 18 years old." };
  }

  // Salary validation
  const salary = parseFloat(employee.salary as string);
  if (salary < 1000) {
    return { error: "Salary must be greater than 1000." };
  }

  // Handle the file upload
  const photoFile = formData.get("photo_path");
  let photoPath = null;


  if (photoFile && photoFile instanceof File) {
    const fileName = `${uuidv4()}.jpg`; // Generate a unique name for the photo
    const filePath = path.join(uploadDir, fileName); // Save in 'public/uploads'

    const photoData = await photoFile.arrayBuffer();

    // Ensure the uploads directory exists
    await fs.promises.mkdir(uploadDir, { recursive: true });

    // Save the uploaded file
    await fs.promises.writeFile(filePath, Buffer.from(photoData));

    // Set the relative file path to store in the database
    photoPath = path.join("uploads", fileName); // Store relative path in database
  }

  // Insert employee data into the database
  const db = await getDB();
  await db.run(
    `INSERT INTO employees (
      first_name, last_name, email, phone_number, date_of_birth,
      job_title, department, salary, start_date, end_date, photo_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    Object.values({
      ...employee,
      photo: photoPath, // Store the relative photo path
    })
  );

  return redirect("/employees");
}

export default function NewEmployeePage() {
  const { departments } = useLoaderData<typeof loader>();
  const actionData = useActionData();

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Create New Employee</h1>
        {/* You can add header actions here */}
      </div>

      {/* Display errors if any */}
      {actionData?.error && (
        <div className="error-message">
          <p>{actionData.error}</p>
        </div>
      )}

      <Form
        method="post"
        encType="multipart/form-data"
        className="form-container"
      >
        {/* Personal Information */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="first_name">First Name *</label>
            <input id="first_name" type="text" name="first_name" required />
          </div>
          <div className="form-group">
            <label htmlFor="last_name">Last Name *</label>
            <input id="last_name" type="text" name="last_name" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input id="email" type="email" name="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="phone_number">Phone Number</label>
            <input id="phone_number" type="tel" name="phone_number" />
          </div>
          <div className="form-group">
            <label htmlFor="date_of_birth">Date of Birth *</label>
            <input
              id="date_of_birth"
              type="date"
              name="date_of_birth"
              required
            />
          </div>
        </div>

        {/* Professional Information */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="job_title">Job Title *</label>
            <input id="job_title" type="text" name="job_title" required />
          </div>
          <div className="form-group">
            <label htmlFor="department">Department *</label>
            <select id="department" name="department" required>
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="salary">Salary *</label>
            <input
              id="salary"
              type="number"
              name="salary"
              required
              min="1000"
            />
          </div>
          <div className="form-group">
            <label htmlFor="start_date">Start Date *</label>
            <input id="start_date" type="date" name="start_date" required />
          </div>
          <div className="form-group">
            <label htmlFor="end_date">End Date</label>
            <input id="end_date" type="date" name="end_date" />
          </div>
        </div>

        {/* Photo Upload */}
        <div className="form-group">
          <label htmlFor="photo_path">Upload Photo</label>
          <input
            id="photo_path"
            type="file"
            name="photo_path"
            accept="image/*"
            required
          />
        </div>

        {/* Buttons */}
        <div className="header-actions">
          <Link to="/employees" className="button secondary-button">
            Cancel
          </Link>
          <button type="submit" className="button primary-button">
            Create Employee
          </button>
        </div>
      </Form>
    </div>
  );
}