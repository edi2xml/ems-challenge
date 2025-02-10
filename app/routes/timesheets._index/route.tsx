import { Link, useLoaderData } from "react-router";
import { useState, useEffect } from "react";
import { getDB } from "~/db/getDB";
import { createCalendar, viewMonthGrid, viewWeek } from "@schedule-x/calendar";
import "@schedule-x/theme-default/dist/index.css";
import "../../app.css";

export async function loader() {
  const db = await getDB();
  const timesheetsAndEmployees = await db.all(
    "SELECT timesheets.*, employees.first_name || ' ' || employees.last_name AS full_name, employees.id AS employee_id FROM timesheets JOIN employees ON timesheets.employee_id = employees.id"
  );

  return { timesheetsAndEmployees };
}

interface Timesheet {
  id: number;
  full_name: string;
  employee_id: number;
  start_time: string;
  end_time: string;
}

export default function TimesheetsPage() {
  const { timesheetsAndEmployees } = useLoaderData() as {
    timesheetsAndEmployees: Timesheet[];
  };
  const [view, setView] = useState("table");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let calendarInstance: any = null;

    if (view === "calendar") {
      const calendarEl = document.getElementById("calendar");

      if (calendarEl) {
        // Clear previous content before rendering
        calendarEl.innerHTML = "";

        calendarInstance = createCalendar({
          views: [viewMonthGrid, viewWeek],
          selectedDate: new Date().toISOString().split("T")[0],
          defaultView: viewMonthGrid.name,
          events: timesheetsAndEmployees.map((timesheet: Timesheet) => ({
            id: timesheet.id,
            title: `Work - ${timesheet.full_name}`,
            start: timesheet.start_time,
            end: timesheet.end_time,
          })),
        });

        calendarInstance.render(calendarEl);
      } else {
        console.error("Calendar element not found");
      }
    }

    return () => {
      // Cleanup calendar when switching views
      if (calendarInstance) {
        calendarInstance.destroy?.(); // Destroy calendar instance if applicable
      }
    };
  }, [view, timesheetsAndEmployees]);

  // Filter timesheets based on search input
  const filteredTimesheets = timesheetsAndEmployees.filter((timesheet) =>
    timesheet.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Timesheets</h1>
        <div className="header-actions">
          <button
            className="button primary-button"
            onClick={() => setView("table")}
          >
            Table View
          </button>
          <button
            className="button secondary-button"
            onClick={() => setView("calendar")}
          >
            Calendar View
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by employee name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {view === "table" ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Start Time</th>
                <th>End Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredTimesheets.map((timesheet: Timesheet) => (
                <tr key={timesheet.id}>
                  <td>{timesheet.id}</td>
                  <td>{timesheet.full_name}</td>
                  <td>{timesheet.start_time}</td>
                  <td>{timesheet.end_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div id="calendar" style={{ height: "500px" }}></div>
      )}

      <hr />
      <ul>
        <Link to="/timesheets/new" className="button secondary-button">
          New Timesheet
        </Link>
        <Link to="/employees" className="button secondary-button">
          Employees
        </Link>
      </ul>
    </div>
  );
}
