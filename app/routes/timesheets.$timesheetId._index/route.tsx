import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router-dom";
import { Form, Link, useLoaderData, useActionData } from "react-router-dom";
import { getDB } from "~/db/getDB";

export async function loader({ params }: LoaderFunctionArgs) {
  const db = await getDB();

  const timesheet = await db.get(
    "SELECT * FROM timesheets WHERE id = ?",
    params.timesheetId
  );

  if (!timesheet) {
    throw new Response("Timesheet not found", { status: 404 });
  }

  const employees = await db.all(
    "SELECT id, first_name, last_name FROM employees"
  );

  return { timesheet, employees };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const db = await getDB();
    await db.run("DELETE FROM timesheets WHERE id = ?", params.timesheetId);
    return redirect("/timesheets");
  }

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
     return { error: "End time must be after start time" };
   }


  const db = await getDB();
  await db.run(
    `UPDATE timesheets 
     SET employee_id = ?, start_time = ?, end_time = ?, summary = ?
     WHERE id = ?`,
    [...Object.values(timesheet), params.timesheetId]
  );

  return redirect("/timesheets");
}

export default function EditTimesheet() {
  const { timesheet, employees } = useLoaderData<typeof loader>();
  type ActionData = { error: string } | undefined;

  // In your component:
  const actionData = useActionData<ActionData>();

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Edit Timesheet</h1>

        <div className="header-actions">
          <Form method="post" style={{ display: "inline" }}>
            <button
              type="submit"
              name="intent"
              value="delete"
              className="delete-button"
              onClick={(e) => {
                if (
                  !confirm("Are you sure you want to delete this timesheet?")
                ) {
                  e.preventDefault();
                }
              }}
            >
              Delete
            </button>
          </Form>
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
            <select
              name="employee_id"
              defaultValue={timesheet.employee_id}
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
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
            <input
              type="datetime-local"
              name="start_time"
              defaultValue={timesheet.start_time?.slice(0, 16)}
              required
            />
          </div>
          <div className="form-group">
            <label>End Time *</label>
            <input
              type="datetime-local"
              name="end_time"
              defaultValue={timesheet.end_time?.slice(0, 16)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Summary</label>
            <textarea
              name="summary"
              rows={4}
              defaultValue={timesheet.summary}
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
            Update Timesheet
          </button>
        </div>
      </Form>
    </div>
  );
}
