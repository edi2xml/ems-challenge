import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router-dom";
import { Form, Link, useLoaderData } from "react-router-dom";
import { getDB } from "~/db/getDB";

export async function loader({ params }: LoaderFunctionArgs) {
  const db = await getDB();

  // Get employee details
  const employee = await db.get(
    "SELECT * FROM employees WHERE id = ?",
    params.employeeId
  );

  if (!employee) {
    throw new Response("Employee not found", { status: 404 });
  }

  // Get departments for the dropdown
  const departments = await db.all("SELECT DISTINCT department FROM employees");

  return({
    employee,
    departments: departments.map((d) => d.department),
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const db = await getDB();
    await db.run("DELETE FROM employees WHERE id = ?", params.employeeId);
    return redirect("/employees");
  }

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
  };

  const db = await getDB();
  await db.run(
    `UPDATE employees SET 
      first_name = ?, last_name = ?, email = ?, phone_number = ?,
      date_of_birth = ?, job_title = ?, department = ?, salary = ?,
      start_date = ?, end_date = ?
    WHERE id = ?`,
    [...Object.values(employee), params.employeeId]
  );

  return redirect("/employees");
}

export default function EmployeePage() {
  const { employee, departments } = useLoaderData<typeof loader>();

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">
          {employee.first_name} {employee.last_name}
        </h1>
        <div className="header-actions">
          <Form method="post" style={{ display: "inline" }}>
            <button
              type="submit"
              name="intent"
              value="delete"
              className="button secondary-button"
              onClick={(e) => {
                if (
                  !confirm("Are you sure you want to delete this employee?")
                ) {
                  e.preventDefault();
                }
              }}
            >
              Delete
            </button>
          </Form>
        </div>
      </div>

      <Form method="post" className="form-container">
        {/* Personal Information */}
        <div className="form-row">
          <div className="form-group">
            <label>First Name *</label>
            <input
              type="text"
              name="first_name"
              defaultValue={employee.first_name}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name *</label>
            <input
              type="text"
              name="last_name"
              defaultValue={employee.last_name}
              required
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              defaultValue={employee.email}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              defaultValue={employee.phone_number}
            />
          </div>
          <div className="form-group">
            <label>Date of Birth *</label>
            <input
              type="date"
              name="date_of_birth"
              defaultValue={employee.date_of_birth}
              required
            />
          </div>
        </div>

        {/* Professional Information */}
        <div className="form-row">
          <div className="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              name="job_title"
              defaultValue={employee.job_title}
              required
            />
          </div>
          <div className="form-group">
            <label>Department *</label>
            <select
              name="department"
              defaultValue={employee.department}
              required
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Salary *</label>
            <input
              type="number"
              name="salary"
              defaultValue={employee.salary}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Start Date *</label>
            <input
              type="date"
              name="start_date"
              defaultValue={employee.start_date}
              required
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="end_date"
              defaultValue={employee.end_date || ""}
            />
          </div>
        </div>

        {/* Employee Photo */}
        {employee.photo_path && (
          <div className="form-row">
            <div className="form-group">
              <label>Current Photo</label>
              <img
                src={employee.photo_path}
                alt="Employee"
                style={{ maxWidth: "200px" }}
              />
            </div>
          </div>
        )}

        <div className="header-actions">
          <Link to="/employees" className="button secondary-button">
            Cancel
          </Link>
          <button type="submit" className="button primary-button">
            Update Employee
          </button>
        </div>
      </Form>
    </div>
  );
}
