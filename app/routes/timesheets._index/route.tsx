import { Link, useLoaderData } from "react-router";
import { useState, useEffect } from "react";
import { getDB } from "~/db/getDB";
import { createCalendar, viewMonthGrid, viewWeek } from "@schedule-x/calendar";
import "@schedule-x/theme-default/dist/calendar.css";
import "../../app.css";
import {
  Box,
  Button,
  Select,
  MenuItem,
  InputLabel,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  FormControl,
  Typography,
  TablePagination,
} from "@mui/material";


export async function loader() {
  const db = await getDB();
  const timesheetsAndEmployees = await db.all(
    "SELECT timesheets.*, employees.full_name, employees.id AS employee_id FROM timesheets JOIN employees ON timesheets.employee_id = employees.id"
  );

  return { timesheetsAndEmployees };
}

interface Timesheet {
  id: number;
  full_name: string;
  employee_id: number;
  start_time: string;
  end_time: string;
  summary: string;
}

export default function TimesheetsPage() {
  const { timesheetsAndEmployees } = useLoaderData() as {
    timesheetsAndEmployees: Timesheet[];
  };
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTableView, setIsTableView] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  
  const [timesheets, setTimesheets] = useState(timesheetsAndEmployees);

  useEffect(() => {
    let calendarInstance: any = null;

    if (!isTableView) {
      const calendarEl = document.getElementById("calendar");

      if (calendarEl) {
        calendarEl.innerHTML = "";

        const events = timesheets
          .filter((ts) => {
            const matchesEmployee = selectedEmployee
              ? ts.employee_id === parseInt(selectedEmployee)
              : true;
            const matchesSearch =
              ts.full_name?.toLowerCase().includes(searchTerm) ||
              ts.summary?.toLowerCase().includes(searchTerm) ||
              ts.start_time?.toLowerCase().includes(searchTerm) ||
              ts.end_time?.toLowerCase().includes(searchTerm);
            return matchesEmployee && matchesSearch;
          })
          .map((ts) => {
    
            const formatDate = (dateString: string) => {
              const date = new Date(dateString);
              const year = date.getUTCFullYear();
              const month = String(date.getUTCMonth() + 1).padStart(2, "0");
              const day = String(date.getUTCDate()).padStart(2, "0");
              const hours = String(date.getUTCHours()).padStart(2, "0");
              const minutes = String(date.getUTCMinutes()).padStart(2, "0");
              return `${year}-${month}-${day} ${hours}:${minutes}`;
            };

            return {
              id: ts.id,
              title: `${ts.full_name} - ${ts.summary}`,
              start: formatDate(ts.start_time), 
              end: formatDate(ts.end_time), 
            };
          });

        calendarInstance = createCalendar({
          views: [viewMonthGrid, viewWeek],
          selectedDate: new Date().toISOString().split("T")[0],
          defaultView: viewMonthGrid.name,
          events: events,
        });

        calendarInstance.render(calendarEl);
      } else {
        console.error("Calendar element not found");
      }
    }

    return () => {
      if (calendarInstance) {
        calendarInstance.destroy?.();
      }
    };
  }, [isTableView, timesheets, selectedEmployee, searchTerm]);

  const filteredTimesheets = timesheets.filter((ts) => {
    const matchesEmployee = selectedEmployee
      ? ts.employee_id === parseInt(selectedEmployee)
      : true;
    const matchesSearch =
      ts.full_name?.toLowerCase().includes(searchTerm) ||
      ts.summary?.toLowerCase().includes(searchTerm) ||
      ts.start_time?.toLowerCase().includes(searchTerm) ||
      ts.end_time?.toLowerCase().includes(searchTerm);
    return matchesEmployee && matchesSearch;
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const handleDelete = async (id: number) => {
  //   const response = await fetch(`/api/timesheets/${id}`, {
  //     method: "DELETE",
  //   });

  //   if (response.ok) {
  //     const updatedTimesheets = timesheets.filter((ts) => ts.id !== id);
  //     setTimesheets(updatedTimesheets);
  //     console.log("Timesheet deleted successfully.");
  //   } else {
  //     console.error("Failed to delete timesheet", await response.text());
  //   }
  // };

  return (
    <Box className="container">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Timesheets</Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsTableView(true)}
            sx={{ mr: 2 }}
          >
            Table View
          </Button>
          <Button variant="outlined" onClick={() => setIsTableView(false)}>
            Calendar View
          </Button>
        </Box>
      </Box>

      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel>Filter by Employee</InputLabel>
        <Select
          value={selectedEmployee}
          label="Filter by Employee"
          onChange={(e) => setSelectedEmployee(e.target.value as string)}
        >
          <MenuItem value="">All Employees</MenuItem>
          {timesheets.map((emp) => (
            <MenuItem key={emp.employee_id} value={emp.employee_id}>
              {emp.full_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Search"
        placeholder="Search by any field..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        margin="normal"
        variant="outlined"
      />

      {isTableView ? (
        <>
          <Table>
  <TableHead>
    <TableRow>
      <TableCell>ID</TableCell>
      <TableCell>Employee</TableCell>
      <TableCell>Summary</TableCell>
      <TableCell>Actions</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {filteredTimesheets
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((timesheet) => (
        <TableRow key={timesheet.id}>
          <TableCell>{timesheet.id}</TableCell>
          <TableCell>{timesheet.full_name}</TableCell>
          <TableCell>{timesheet.summary}</TableCell>
          <TableCell>
            <Button
              component={Link}
              to={`/timesheets/${timesheet.id}`}
              variant="contained"
              color="primary"
              size="small"
            >
              View Details
            </Button>
          </TableCell>
        </TableRow>
      ))}
  </TableBody>
</Table>

          <TablePagination
            component="div"
            count={filteredTimesheets.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      ) : (
        <Box id="calendar" sx={{ height: "500px", mt: 2 }} />
      )}

      <Box mt={4}>
        <Button variant="contained" component={Link} to="/timesheets/new" sx={{ mr: 2 }}>
          New Timesheet
        </Button>
        <Button variant="outlined" component={Link} to="/employees">
          Employees
        </Button>
      </Box>
    </Box>
  );
}