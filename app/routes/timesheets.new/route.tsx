import {redirect, type ActionFunctionArgs } from "react-router-dom";
import { Form, Link, useLoaderData, useActionData } from "react-router-dom";
import { getDB } from "~/db/getDB";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
}

export async function loader() {
  const db = await getDB();
  const employees = await db.all(
    "SELECT id, first_name, last_name FROM employees"
  );
  return ({ employees });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
function formatDateTime(dateTime: string) {
  return dateTime.replace("T", " "); // Converts "2025-02-10T16:44" → "2025-02-10 16:44"
}

const timesheet = {
  employee_id: formData.get("employee_id"),
  start_time: formatDateTime(formData.get("start_time") as string),
  end_time: formatDateTime(formData.get("end_time") as string),
  summary: formData.get("summary"),
};

  // Validation
  const startTime = new Date(timesheet.start_time as string);
  const endTime = new Date(timesheet.end_time as string);

  if (startTime >= endTime) {
    return (
      { error: "End time must be after start time" }
    );
  }

  const db = await getDB();
  await db.run(
    `INSERT INTO timesheets (employee_id, start_time, end_time, summary)
     VALUES (?, ?, ?, ?)`,
    Object.values(timesheet)
  );

  return redirect("/timesheets");
}

export default function NewTimesheet() {
  const { employees } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Create New Timesheet</h1>
        <div className="header-actions">
          <Link to="/timesheets" className="button secondary-button">
            Back to Timesheets
          </Link>
          <Link to="/employees" className="button secondary-button">
            View Employees
          </Link>
        </div>
      </div>

      {actionData?.error && (
        <div className="error-message">{actionData.error}</div>
      )}

      <Form method="post" className="form-container">
        <div className="form-row">
          <div className="form-group">
            <label>Employee *</label>
            <select name="employee_id" required>
              <option value="">Select Employee</option>
              {employees.map((emp: Employee) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Time *</label>
            <input type="datetime-local" name="start_time" required />
          </div>
          <div className="form-group">
            <label>End Time *</label>
            <input type="datetime-local" name="end_time" required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Summary</label>
            <textarea
              name="summary"
              rows={4}
              placeholder="Describe the work done during this period..."
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="header-actions">
          <Link to="/timesheets" className="button secondary-button">
            Cancel
          </Link>
          <button type="submit" className="button primary-button">
            Create Timesheet
          </button>
        </div>
      </Form>
    </div>
  );
}
