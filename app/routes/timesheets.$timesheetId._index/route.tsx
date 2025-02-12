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


export async function loader({ params }: LoaderFunctionArgs) {
  const db = await getDB();
  const timesheet = await db.get(
    `
    SELECT timesheets.*, employees.full_name 
    FROM timesheets 
    JOIN employees ON timesheets.employee_id = employees.id
    WHERE timesheets.id = ?
  `,
    params.timesheetId
  );

  if (!timesheet) {
    throw new Response("Not Found", { status: 404 });
  }

  return { timesheet };
}


export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const db = await getDB();

  if (request.method === "PUT") {
    await db.run(
      `
      UPDATE timesheets 
      SET 
        summary = ?,
        start_time = ?,
        end_time = ?
      WHERE id = ?
    `,
      formData.get("summary"),
      formData.get("start_time"),
      formData.get("end_time"),
      params.timesheetId
    );
    return { success: true };
  }

  return { success: false };
}

export default function TimesheetDetailsPage() {
  const { timesheet } = useLoaderData<typeof loader>();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 6 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4">
            {isEditing ? "Edit Timesheet" : "Timesheet Details"}
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
            <Button component={Link} to="/timesheets" variant="contained" color="inherit">
              Back to List
            </Button>
          </Box>
        </Box>

        {isEditing ? (
          <Form method="put">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Summary"
                  name="summary"
                  defaultValue={timesheet.summary}
                  fullWidth
                  required
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Time"
                  type="datetime-local"
                  name="start_time"
                  defaultValue={new Date(timesheet.start_time).toISOString().slice(0, 16)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End Time"
                  type="datetime-local"
                  name="end_time"
                  defaultValue={new Date(timesheet.end_time).toISOString().slice(0, 16)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
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
              <Typography variant="h6">Employee Information</Typography>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Employee Name
                </Typography>
                <Typography>{timesheet.full_name}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Time Information</Typography>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Start Time
                </Typography>
                <Typography>
                  {new Date(timesheet.start_time).toLocaleString()}
                </Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  End Time
                </Typography>
                <Typography>
                  {new Date(timesheet.end_time).toLocaleString()}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" mt={2}>Summary</Typography>
              <Box mt={2}>
                <Typography>{timesheet.summary}</Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Container>
  );
}