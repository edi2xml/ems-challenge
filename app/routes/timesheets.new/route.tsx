import { useLoaderData, Form, redirect, type ActionFunction } from "react-router-dom";
import { getDB } from "~/db/getDB";
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  Paper,
} from "@mui/material";
import { useEffect } from "react";


export async function loader() {
  const db = await getDB();
  const employees = await db.all("SELECT id, full_name FROM employees");
  return { employees };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const employee_id = formData.get("employee_id");
  const start_time = formData.get("start_time");
  const end_time = formData.get("end_time");
  const summary = formData.get("summary");

  if (new Date(start_time) >= new Date(end_time)) {
    throw new Error("Start time must be before end time.");
  }

  if (!summary || summary.trim() === "") {
    throw new Error("Summary is required.");
  }

  const db = await getDB();
  await db.run(
    "INSERT INTO timesheets (employee_id, start_time, end_time, summary) VALUES (?, ?, ?, ?)",
    [employee_id, start_time, end_time, summary]
  );

  return redirect("/timesheets");
};

export default function NewTimesheetPage() {
  const { employees } = useLoaderData();

  useEffect(() => {
    console.log("Component mounted or updated");
  }, []);

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 5 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Timesheet
        </Typography>

        <Form method="post">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Employee Dropdown */}
            <TextField
              select
              name="employee_id"
              id="employee_id"
              label="Employee"
              required
              fullWidth
              variant="outlined"
            >
              <MenuItem value="">Select an employee</MenuItem>
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.full_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="datetime-local"
              name="start_time"
              id="start_time"
              label="Start Time"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />

            <TextField
              type="datetime-local"
              name="end_time"
              id="end_time"
              label="End Time"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />

            <TextField
              name="summary"
              id="summary"
              label="Summary"
              required
              multiline
              rows={4}
              fullWidth
              variant="outlined"
            />

  
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ alignSelf: "flex-start" }}
            >
              Create Timesheet
            </Button>
          </Box>
        </Form>

        <hr style={{ margin: "20px 0" }} />


        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            href="/timesheets"
            variant="outlined"
            color="secondary"
            sx={{ textTransform: "none" }}
          >
            Timesheets
          </Button>
          <Button
            href="/employees"
            variant="outlined"
            color="secondary"
            sx={{ textTransform: "none" }}
          >
            Employees
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}