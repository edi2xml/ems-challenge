import { useLoaderData, Link } from "react-router";
import { getDB } from "~/db/getDB";
import { useState } from "react";

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

    // Handle strings (alphabetical comparison)
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
    <div>
      <h1>Employees</h1>
      <input
        type="text"
        placeholder="Search employees"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
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
      <button onClick={() => setSortField("last_name")}>Name</button>
      <button onClick={() => setSortField("department")}>Department</button>
      <button onClick={() => setSortField("job_title")}>Job Title</button>
      <button onClick={() => setSortField("start_date")}>Start Date</button>
      <button onClick={() => setSortField("salary")}>Salary</button>
      <button onClick={() => setSortField("end_date")}>End Date</button>
      <button
        onClick={() =>
          setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        }
      >
        {sortDirection === "asc" ? "↑" : "↓"}
      </button>

      {/* Navigation buttons */}
      <div>
        <Link to="/employees/new">
          <button>Add New Employee</button>
        </Link>
        <Link to="/timesheets">
          <button>Timesheets</button>
        </Link>
      </div>

      <ul>
        {currentEmployees.map((emp: any) => (
          <li key={emp.id}>
            <img
              src={emp.photo_path}
              alt={`${emp.first_name} ${emp.last_name}`}
            />
            <h2>
              {emp.first_name} {emp.last_name}
            </h2>
            <p>{emp.department}</p>
            <p>{emp.job_title}</p>
            <p>{emp.start_date}</p>
            <p>{emp.salary}</p>
            <p>{emp.end_date}</p>
            {/* Link to employee detail page */}
            <Link to={`/employees/${emp.id}`}>
              <button>View Details</button>
            </Link>
          </li>
        ))}
      </ul>

      <button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
      <p>
        Page {currentPage} of {totalPages}
      </p>
    </div>
  );
}
