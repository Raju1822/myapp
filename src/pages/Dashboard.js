
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';



import { useEffect, useState } from 'react';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('loggedInUser')); // Logged-in manager/director
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // useEffect(() => {
  //   if (user && user.EmployeeId) {
  //     fetch(`http://localhost:5000/api/mapped-emp/${user.EmployeeId}`)
  //       .then(res => res.json())
  //       .then(data => setEmployees(data))
  //       .catch(err => console.error('Error fetching employees:', err));
  //   }
  // }, [user]);


  useEffect(() => {
    if (user && user.EmployeeId) {
      fetch(`http://localhost:5000/api/mapped-emp/${user.EmployeeId}`)
        .then(res => res.json())
        .then(data => {
          // Handle both shapes: array-only or { success, data }
          const list = Array.isArray(data) ? data : (data?.data ?? []);
          setEmployees(list);
        })
        .catch(err => console.error('Error fetching employees:', err));
    }
  }, [user]);


  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
    const modal = new window.bootstrap.Modal(document.getElementById('employeeModal'));
    modal.show();
  };

  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/');
  };

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Productivity',
        data: [65, 59, 80, 81, 56],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };



//Task
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);


    useEffect(() => {
      fetch(`http://localhost:5000/api/directmembers/${user.EmployeeId}`)
        .then(response => response.json())
        .then(data => setMembers(data))
        .catch(error => console.error('Error fetching members:', error));
    }, []);



  const [isEditing, setIsEditing] = useState(false);
  const [taskData, setTaskData] = useState({
    task_id: null,
    title: "",
    description: "",
    assigned_to: "",
    start_date: "",
    due_date: "",
    priority: "Medium"
  });



  // Fetch tasks assigned by manager

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch(`http://localhost:5000/api/manager-tasks/${user.EmployeeId}`);
      const data = await res.json();
      setTasks(data);
    };
    fetchTasks();
  }, [user.EmployeeId]);


  const fetchTasks = async () => {
    const res = await fetch(`http://localhost:5000/api/manager-tasks/${user.EmployeeId}`);
    const data = await res.json();
    setTasks(data);
  };



  const handleTaskChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const handleAddTaskClick = () => {
    setIsEditing(false);
    setTaskData({ task_id: null, title: "", description: "", assigned_to: "", start_date: "", due_date: "", priority: "Medium" });
    setShowModal(true);
  };

  const handleEditTaskClick = (task) => {
    setIsEditing(true);
    setTaskData({
      task_id: task.task_id,
      title: task.title,
      description: task.description,
      assigned_to: task.assigned_to,
      start_date: task.start_date ? task.start_date.split("T")[0] : "",
      due_date: task.due_date ? task.due_date.split("T")[0] : "",
      priority: task.priority
    });
    setShowModal(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    const url = isEditing
      ? `http://localhost:5000/api/update-task/${taskData.task_id}`
      : "http://localhost:5000/api/add-task";

    const method = isEditing ? "PATCH" : "POST";

    const payload = { ...taskData, assigned_by: user.EmployeeId };

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    alert(result.message);
    setShowModal(false);
    fetchTasks();
  };


  //Delete task

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/delete-task/${taskId}`, {
          method: "DELETE"
        });
        const result = await response.json();
        alert(result.message);
        fetchTasks(); // Refresh task list
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task. Please try again.");
      }
    }
  };









  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="bg-dark text-white p-3" style={{ width: '250px', minHeight: '100vh' }}>
        <h4>Admin Panel</h4>
        <ul className="nav flex-column mt-4">
          <li className="nav-item"><a className="nav-link text-white" href="#a">Dashboard</a></li>
          <li className="nav-item"><a className="nav-link text-white" href="#a">Users</a></li>
          <li className="nav-item"><a className="nav-link text-white" href="#a">Reports</a></li>
        </ul>
        <button className="btn btn-danger mt-4" onClick={handleLogout}>Logout</button>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4">


        <img
          src={user.profile_picture_url || 'https://avatar.iran.liara.run/public'}
          alt="Profile"
          className="rounded-circle"
          width="50"
        />



        <h2>Welcome, {user?.firstname || 'Admin'}!</h2>
        <div className="row mt-4">
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Total Users</h5>
                <p className="card-text">{employees.length}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Active Projects</h5>
                <p className="card-text">15</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Pending Tasks</h5>
                <p className="card-text">32</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-5">
          <h4>Team Productivity</h4>
          <Bar data={data} />
        </div>




        <div className="container mt-4">
          <h2 className="mb-4">Employees Under {user?.firstname} {user?.lastname}</h2>


          <div class="card-header d-flex justify-content-between align-items-center">
            <span>Active Users</span>
            <div class="btn-actions-pane-right">
              <div class="btn-group btn-group-sm mr-2" role="group">
                <a href="/add-member" class="btn btn-primary">Add Members</a>
              </div>
            </div>
          </div>


          <table className="table table-hover table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Profile</th>
                <th>Emp ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Location</th>
                <th>Designation</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.EmployeeId} onClick={() => handleRowClick(emp)} style={{ cursor: 'pointer' }}>
                  <td>


                    <img
                      src={emp.profile_picture_url || 'https://avatar.iran.liara.run/public'}
                      alt="Profile"
                      className="rounded-circle"
                      width="50"
                    />


                  </td>
                  <td>{emp.EmployeeId}</td>
                  <td>{emp.firstname} {emp.lastname}</td>
                  <td>{emp.email}</td>
                  <td>{emp.location}</td>
                  <td>{emp.post}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bootstrap Modal */}
          <div className="modal fade" id="employeeModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Employee Details</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  {selectedEmployee && (
                    <div className="text-center">

                      <img
                        src={selectedEmployee.profile_picture_url || 'https://avatar.iran.liara.run/public'}
                        alt="Profile"
                        className="rounded-circle"
                        width="50"
                      />

                      <p><strong>Email:</strong> {selectedEmployee.email}</p>
                      <p><strong>Location:</strong> {selectedEmployee.location}</p>
                      <p><strong>Designation:</strong> {selectedEmployee.designation}</p>
                      <p><strong>Role:</strong> {selectedEmployee.role}</p>
                      <p><strong>Date of Joining:</strong> {new Date(selectedEmployee.doj).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>





            <div className="m-4">

              {/* Task List */}
              <div className="card shadow-sm p-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold">Tasks Assigned by You</h5>
                  <button className="btn btn-primary bi bi-plus-circle me-2" onClick={handleAddTaskClick}> Add Task</button>
                </div>
                {tasks.length === 0 ? (
                  <p>No tasks assigned yet.</p>
                ) : (
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Assigned To</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.task_id}>
                          <td>{task.title}</td>
                          <td>{task.assigned_to}</td>
                          <td>{task.status}</td>
                          <td>
                            <span className={`badge ${task.priority === "High" ? "bg-danger" : task.priority === "Medium" ? "bg-warning" : "bg-success"}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td>{new Date(task.due_date).toLocaleDateString()}</td>

                          <td>
                            <button className="btn btn-sm btn-info me-2" onClick={() => handleEditTaskClick(task)}>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteTask(task.task_id)}>Delete</button>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Modal for Add/Edit Task */}
              {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">{isEditing ? "Edit Task" : "Assign New Task"}</h5>
                        <button className="btn-close" onClick={() => setShowModal(false)}></button>
                      </div>
                      <div className="modal-body">
                        <form onSubmit={handleSubmitTask}>
                          <div className="mb-3">
                            <label className="form-label">Task Title</label>
                            <input type="text" name="title" value={taskData.title} onChange={handleTaskChange} className="form-control" required />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea name="description" value={taskData.description} onChange={handleTaskChange} className="form-control" rows="3" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Assign To</label>
                            <select name="assigned_to" value={taskData.assigned_to} onChange={handleTaskChange} className="form-select" required>
                              <option value="">Select Member</option>
                              {members.map((member) => (
                                <option key={member.EmployeeId} value={member.EmployeeId}>
                                  {member.firstname} {member.lastname} ({member.post})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Start Date</label>
                              <input type="date" name="start_date" value={taskData.start_date} onChange={handleTaskChange} className="form-control" />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Due Date</label>
                              <input type="date" name="due_date" value={taskData.due_date} onChange={handleTaskChange} className="form-control" />
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Priority</label>
                            <select name="priority" value={taskData.priority} onChange={handleTaskChange} className="form-select">
                              <option>Low</option>
                              <option>Medium</option>
                              <option>High</option>
                            </select>
                          </div>
                          <button type="submit" className="btn btn-primary w-100">{isEditing ? "Update Task" : "Assign Task"}</button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>










      </div>
    </div>
  );
};

export default Dashboard;