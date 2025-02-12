import { useLoaderData, Form, Link } from "react-router-dom";
import { getDB } from "~/db/getDB";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Paper,
  Box,
} from "@mui/material";

// Loader function
export async function loader({ params }: LoaderFunctionArgs) {
  const db = await getDB();
  const employee = await db.get(
    `
    SELECT * FROM employees 
    WHERE id = ?
  `,
    params.employeeId
  );

  if (!employee) {
    throw new Response("Not Found", { status: 404 });
  }

  return { employee };
}

// Action function
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const db = await getDB();

  if (request.method === "PUT") {
    await db.run(
      `
      UPDATE employees 
      SET 
        full_name = ?,
        email = ?,
        phone_number = ?,
        date_of_birth = ?,
        job_title = ?,
        department = ?,
        salary = ?,
        start_date = ?,
        end_date = ?
      WHERE id = ?
    `,
      formData.get("full_name"),
      formData.get("email"),
      formData.get("phone_number"),
      formData.get("date_of_birth"),
      formData.get("job_title"),
      formData.get("department"),
      formData.get("salary"),
      formData.get("start_date"),
      formData.get("end_date") || null,
      params.employeeId
    );
    return { success: true };
  }

  return { success: false };
}

// Employee Page
export default function EmployeePage() {
  const { employee } = useLoaderData<typeof loader>();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 6 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4">
            {isEditing ? "Edit Employee" : employee.full_name}
          </Typography>
          <Box>
            <Button
              variant="contained"
              color={isEditing ? "secondary" : "primary"}
              onClick={() => setIsEditing(!isEditing)}
              sx={{ mr: 2 }}
            >
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            <Button component={Link} to="/employees" variant="contained" color="inherit">
              Back to List
            </Button>
          </Box>
        </Box>

        {isEditing ? (
          <Form method="put">
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  name="full_name"
                  defaultValue={employee.full_name}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  defaultValue={employee.email}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  name="phone_number"
                  defaultValue={employee.phone_number}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date of Birth"
                  type="date"
                  name="date_of_birth"
                  defaultValue={employee.date_of_birth}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Job Title"
                  name="job_title"
                  defaultValue={employee.job_title}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Department"
                  name="department"
                  defaultValue={employee.department}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Salary"
                  name="salary"
                  type="number"
                  defaultValue={employee.salary}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Date"
                  type="date"
                  name="start_date"
                  defaultValue={employee.start_date}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End Date"
                  type="date"
                  name="end_date"
                  defaultValue={employee.end_date || ""}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Box mt={4} display="flex" justifyContent="flex-end">
              <Button type="submit" variant="contained" color="success">
                Save Changes
              </Button>
            </Box>
          </Form>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Personal Information</Typography>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Email
                </Typography>
                <Typography>{employee.email}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Phone Number
                </Typography>
                <Typography>{employee.phone_number}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Date of Birth
                </Typography>
                <Typography>{new Date(employee.date_of_birth).toLocaleDateString()}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Professional Information</Typography>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Job Title
                </Typography>
                <Typography>{employee.job_title}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Department
                </Typography>
                <Typography>{employee.department}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Salary
                </Typography>
                <Typography>${employee.salary.toLocaleString()}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Start Date
                </Typography>
                <Typography>{new Date(employee.start_date).toLocaleDateString()}</Typography>
              </Box>
              {employee.end_date && (
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    End Date
                  </Typography>
                  <Typography>{new Date(employee.end_date).toLocaleDateString()}</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        )}

        <Box mt={6}>
          <Button component={Link} to="/timesheets" variant="text" color="primary">
            View Timesheets
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
