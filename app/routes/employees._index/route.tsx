import { useLoaderData, Link } from "react-router";
import { getDB } from "~/db/getDB";
import { useState } from "react";
import "../../app.css";

export async function loader() {
  const db = await getDB();
  const employees = await db.all("SELECT * FROM employees;");
  return { employees };
}

export default function EmployeesIndex() {
  const { employees } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const departments = [
    "all",
    ...new Set(employees.map((emp) => emp.department)),
  ];

  const filteredEmployees = employees.filter((employee: any) => {
    const matchesSearch =
      `${employee.first_name} ${employee.last_name} ${employee.department} ${employee.job_title}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" ||
      employee.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const compareValues = (
    a: any,
    b: any,
    field: string,
    direction: "asc" | "desc"
  ) => {
    const valueA = a[field];
    const valueB = b[field];

    // Handle dates
    if (Date.parse(valueA) && Date.parse(valueB)) {
      return direction === "asc"
        ? new Date(valueA).getTime() - new Date(valueB).getTime()
        : new Date(valueB).getTime() - new Date(valueA).getTime();
    }

    // Handle numbers
    if (!isNaN(valueA) && !isNaN(valueB)) {
      return direction === "asc" ? valueA - valueB : valueB - valueA;
    }

    return direction === "asc"
      ? valueA.localeCompare(valueB)
      : valueB.localeCompare(valueA);
  };

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortField) return 0;
    return compareValues(a, b, sortField, sortDirection);
  });

  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = sortedEmployees.slice(startIndex, endIndex);

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Employees</h1>
        <div className="header-actions">
          <Link to="/employees/new">
            <button className="button primary-button">Add New Employee</button>
          </Link>
          <Link to="/timesheets">
            <button className="button secondary-button">Timesheets</button>
          </Link>
        </div>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search employees"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <div className="button-group">
          <button className="button" onClick={() => setSortField("last_name")}>
            Name
          </button>
          <button className="button" onClick={() => setSortField("department")}>
            Department
          </button>
          <button className="button" onClick={() => setSortField("job_title")}>
            Job Title
          </button>
          <button className="button" onClick={() => setSortField("start_date")}>
            Start Date
          </button>
          <button className="button" onClick={() => setSortField("salary")}>
            Salary
          </button>
          <button className="button" onClick={() => setSortField("end_date")}>
            End Date
          </button>
          <button
            className="button"
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
          >
            {sortDirection === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Department</th>
              <th>Job Title</th>
              <th>Start Date</th>
              <th>Salary</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.map((emp: any) => (
              <tr key={emp.id}>
                <td>
                  <img
                    src={emp.photo_path}
                    alt={`${emp.first_name} ${emp.last_name}`}
                    width={50}
                  />
                  </td>
                  <td>
                  {emp.first_name} {emp.last_name}
                </td>
                <td>{emp.department}</td>
                <td>{emp.job_title}</td>
                <td>{emp.start_date}</td>
                <td>{emp.salary}</td>
                <td>{emp.end_date}</td>
                <td>
                  <Link to={`/employees/${emp.id}`}>
                    <button className="button secondary-button">
                      View Details
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          className="button"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          className="button"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        <p>
          Page {currentPage} of {totalPages}
        </p>
      </div>
    </div>
  );
}
