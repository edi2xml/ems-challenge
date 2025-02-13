import { useState } from "react";
import { useLoaderData, Link } from "react-router-dom";
import { getDB } from "~/db/getDB";
import { 
  Button, 
  Container, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  TableSortLabel
} from "@mui/material";

export async function loader() {
  const db = await getDB();
  const employees = await db.all(`
    SELECT 
      id,
      full_name,
      department,
      job_title,
      email
    FROM employees
    ORDER BY full_name ASC;
  `);

  return { employees };
}

type Employee = {
  id: number;
  full_name: string;
  department: string;
  job_title: string;
  email: string;
};

type Order = 'asc' | 'desc';
type OrderBy = keyof Omit<Employee, 'id'>;

export default function EmployeesPage() {
  const { employees } = useLoaderData<typeof loader>();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [orderBy, setOrderBy] = useState<OrderBy>('full_name');
  const [order, setOrder] = useState<Order>('asc');


  const departments = Array.from(new Set(employees.map(emp => emp.department)));

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };


  const getFilteredAndSortedEmployees = () => {
    return employees
      .filter((employee) => {
        const matchesSearch = 
          employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDepartment = selectedDepartment === "" || employee.department === selectedDepartment;
        
        return matchesSearch && matchesDepartment;
      })
      .sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];
        
        if (order === 'asc') {
          return aValue.localeCompare(bValue);
        }
        return bValue.localeCompare(aValue);
      });
  };

  const filteredAndSortedEmployees = getFilteredAndSortedEmployees();
  const paginatedEmployees = filteredAndSortedEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container sx={{ paddingY: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Typography variant="h4" fontWeight="bold">Employees</Typography>
        <div>
          <Button
            component={Link}
            to="/employees/new"
            variant="contained"
            color="primary"
            sx={{ marginRight: 2 }}
          >
            New Employee
          </Button>
          <Button
            component={Link}
            to="/timesheets"
            variant="contained"
            color="secondary"
          >
            Timesheets
          </Button>
        </div>
      </div>

  
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, department, job title, or email..."
          sx={{ flex: 2 }}
        />
        <FormControl variant="outlined" sx={{ flex: 1 }}>
          <InputLabel>Department</InputLabel>
          <Select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            label="Department"
          >
            <MenuItem value="">All Departments</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="employee table">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'full_name'}
                  direction={orderBy === 'full_name' ? order : 'asc'}
                  onClick={() => handleRequestSort('full_name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'department'}
                  direction={orderBy === 'department' ? order : 'asc'}
                  onClick={() => handleRequestSort('department')}
                >
                  Department
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'job_title'}
                  direction={orderBy === 'job_title' ? order : 'asc'}
                  onClick={() => handleRequestSort('job_title')}
                >
                  Job Title
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'email'}
                  direction={orderBy === 'email' ? order : 'asc'}
                  onClick={() => handleRequestSort('email')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEmployees.map((employee) => (
              <TableRow key={employee.id} sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}>
                <TableCell>{employee.full_name}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.job_title}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/employees/${employee.id}`}
                    color="primary"
                    variant="text"
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
          count={filteredAndSortedEmployees.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Rows per page:"
        />
      </TableContainer>
    </Container>
  );
}