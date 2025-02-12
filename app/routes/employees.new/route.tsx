import { Form, redirect, type ActionFunction } from "react-router";
import { getDB } from "~/db/getDB";
import { TextField, Button, Grid, Typography, Box, Link } from "@mui/material";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();


  const employeeData = {
    full_name: formData.get("full_name"),
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
    `INSERT INTO employees (
      full_name, 
      email, 
      phone_number, 
      date_of_birth, 
      job_title, 
      department, 
      salary, 
      start_date, 
      end_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      employeeData.full_name,
      employeeData.email,
      employeeData.phone_number,
      employeeData.date_of_birth,
      employeeData.job_title,
      employeeData.department,
      employeeData.salary,
      employeeData.start_date,
      employeeData.end_date,
    ]
  );

  return redirect("/employees");
};

export default function NewEmployeePage() {
  return (
    <Box sx={{ maxWidth: 1200, margin: "auto", padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create New Employee
      </Typography>

      <Form method="post">
        <Grid container spacing={3}>
  
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Personal Information</Typography>

            <TextField
              label="Full Name"
              name="full_name"
              id="full_name"
              required
              fullWidth
              margin="normal"
            />

            <TextField
              label="Email"
              name="email"
              id="email"
              required
              fullWidth
              margin="normal"
              type="email"
            />

            <TextField
              label="Phone Number"
              name="phone_number"
              id="phone_number"
              required
              fullWidth
              margin="normal"
              pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
              placeholder="123-456-7890"
            />

            <TextField
              label="Date of Birth"
              name="date_of_birth"
              id="date_of_birth"
              required
              fullWidth
              margin="normal"
              type="date"
              InputLabelProps={{
                shrink: true, 
              }}
            />
          </Grid>

    
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Professional Information</Typography>

            <TextField
              label="Job Title"
              name="job_title"
              id="job_title"
              required
              fullWidth
              margin="normal"
            />

            <TextField
              label="Department"
              name="department"
              id="department"
              required
              fullWidth
              margin="normal"
            />

            <TextField
              label="Salary"
              name="salary"
              id="salary"
              required
              fullWidth
              margin="normal"
              type="number"
              inputProps={{ min: 0, step: 1000 }}
            />

            <TextField
              label="Start Date"
              name="start_date"
              id="start_date"
              required
              fullWidth
              margin="normal"
              type="date"
              InputLabelProps={{
                shrink: true, 
              }}
            />

            <TextField
              label="End Date"
              name="end_date"
              id="end_date"
              fullWidth
              margin="normal"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "space-between", paddingTop: 2 }}>
          <Link href="/employees" sx={{ alignSelf: "center", color: "text.secondary" }}>
            Cancel
          </Link>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ alignSelf: "center" }}
          >
            Create Employee
          </Button>
        </Box>
      </Form>

      <Box sx={{ marginTop: 3, borderTop: "1px solid", paddingTop: 2 }}>
        <Link href="/employees" sx={{ color: "primary.main", textDecoration: "none" }}>
          Back to Employees
        </Link>
        <br />
        <Link href="/timesheets" sx={{ color: "primary.main", textDecoration: "none" }}>
          View Timesheets
        </Link>
      </Box>
    </Box>
  );
}
