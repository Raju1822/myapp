import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';

import { Chart, registerables } from "chart.js";
Chart.register(...registerables);


const ManagerDashboard = () => {


  //Get loggedin user data
  const user = JSON.parse(localStorage.getItem('loggedInUser'));

  //For logout 
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser'); // ✅ Clear user data
    navigate('/'); // ✅ Redirect to login page
  };


  //user details

  const [members, setMembers] = useState([]);
  useEffect(() => {
    fetch('http://localhost:5000/api/members')
      .then(response => response.json())
      .then(data => setMembers(data))
      .catch(error => console.error('Error fetching members:', error));
  }, []);





  //get badge color

  const badgeColors = {
    "data analyst": "badge-info",
    "data analyst 2": "badge-secondary",
    "project manager": "badge-success",
    "software engineer": "badge-primary",
    "qa engineer": "badge-warning",
    "data scientist": "badge-danger",
    "business analyst": "badge-dark",
    "product owner": "badge-light",
    "devops engineer": "badge-info",
    "ui designer": "badge-success" // custom class if you have it
  };


  //Details of member 

  const [selectedMember, setSelectedMember] = useState(null);

  // const [showForm, setShowForm] = useState(false);
  // const [member, setMember] = useState({ name: '', email: '', role: '' });

  // const handleAddMemberClick = () => setShowForm(!showForm);

  // const handleChange = (e) => {
  //   setMember({ ...member, [e.target.name]: e.target.value });
  // };


  //Task
  //  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);





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


  //Bar charts


  const chartRef = useRef(null);

useEffect(() => {
  if (tasks.length > 0 && members.length > 0) {
    if (chartRef.current) chartRef.current.destroy();

    const memberTaskCount = {};
    tasks.forEach(task => {
      memberTaskCount[task.assigned_to] = (memberTaskCount[task.assigned_to] || 0) + 1;
    });

    const labels = Object.keys(memberTaskCount).map(empId => {
      const member = members.find(m => m.EmployeeId === empId);
      return member ? `${member.firstname} ${member.lastname}` : empId;
    });

    const data = Object.values(memberTaskCount);

    // Dynamic colors based on task count
    const colors = data.map(count => {
      if (count <= 2) return "rgba(75, 192, 75, 0.7)"; // Green
      if (count <= 5) return "rgba(255, 159, 64, 0.7)"; // Orange
      if (count <= 9) return "rgba(54, 162, 235, 0.7)"; // Blue
      return "rgba(255, 99, 132, 0.7)"; // Red
    });

    const ctx = document.getElementById("canvas").getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Number of Tasks",
            data: data,
            backgroundColor: colors,
            borderColor: colors.map(c => c.replace("0.7", "1")),
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Tasks Assigned per Member"
          },
          tooltip: {
            callbacks: {
              label: (context) => `Tasks: ${context.parsed.y}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    });
  }
}, [tasks, members]);




  return (


    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>




      <div class="app-container app-theme-white body-tabs-shadow fixed-sidebar fixed-header">
        <div class="app-header header-shadow">
          <div class="app-header__logo">
            <div class="logo-src"></div>
            <div class="header__pane ml-auto">
              <div>
                <button type="button" class="hamburger close-sidebar-btn hamburger--elastic" data-class="closed-sidebar">
                  <span class="hamburger-box">
                    <span class="hamburger-inner"></span>
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div class="app-header__mobile-menu">
            <div>
              <button type="button" class="hamburger hamburger--elastic mobile-toggle-nav">
                <span class="hamburger-box">
                  <span class="hamburger-inner"></span>
                </span>
              </button>
            </div>
          </div>
          <div class="app-header__menu">
            <span>
              <button type="button" class="btn-icon btn-icon-only btn btn-primary btn-sm mobile-toggle-header-nav">
                <span class="btn-icon-wrapper">
                  <i class="fa fa-ellipsis-v fa-w-6"></i>
                </span>
              </button>
            </span>
          </div>

          <div class="app-header__content">
            <div class="app-header-left">
              <div class="search-wrapper">
                <div class="input-holder">
                  <input type="text" class="search-input" placeholder="Type to search" />
                  <button class="search-icon"><span></span></button>
                </div>
                <button class="close"></button>
              </div>
              <ul class="header-menu nav">
                <li class="nav-item">
                  <a href="/" class="nav-link">
                    <i class="nav-link-icon fa fa-database"> </i>
                    Statistics
                  </a>
                </li>
                <li class="btn-group nav-item">
                  <a href="/" class="nav-link">
                    <i class="nav-link-icon fa fa-edit"></i>
                    Projects
                  </a>
                </li>
                <li class="dropdown nav-item">
                  <a href="/" class="nav-link">
                    <i class="nav-link-icon fa fa-cog"></i>
                    Settings
                  </a>
                </li>
              </ul>
            </div>
            <div class="app-header-right">
              <div class="header-btn-lg pr-0">



                <div className="widget-content p-0">
                  <div className="widget-content-wrapper d-flex align-items-center">
                    {/* Left Section - User Dropdown */}
                    <div className="widget-content-left">
                      <div className="dropdown">
                        <button
                          className="btn p-0"
                          type="button"
                          id="userDropdown"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <img
                            width="42"
                            className="rounded-circle"
                            src={user?.profile_picture}
                            alt="User"
                          />
                          <i className="fa fa-angle-down ms-2 opacity-8"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                          <li><button type="button" className="dropdown-item">User Account</button></li>
                          <li><button type="button" className="dropdown-item">Settings</button></li>
                          <li><h6 className="dropdown-header">Header</h6></li>
                          <li><button type="button" className="dropdown-item">Actions</button></li>
                          <li><hr className="dropdown-divider" /></li>
                          <li><button type="button" className="dropdown-item">Dividers</button></li>
                          <li><button type="button" className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                        </ul>
                      </div>
                    </div>

                    {/* Middle Section - User Info */}
                    <div className="widget-content-left ms-3 header-user-info">
                      <div className="widget-heading">Hi, {user?.firstname}!</div>
                      <div className="widget-subheading">{user?.post}</div>
                    </div>

                    {/* Right Section - Calendar Button */}
                    <div className="widget-content-right header-user-info ms-3">
                      <button type="button" className="btn btn-primary btn-sm p-1">
                        <i className="fa fa-calendar text-white"></i>
                      </button>
                    </div>
                  </div>


                </div>
              </div>
            </div>
          </div>









        </div>
        <div class="ui-theme-settings">
          <button type="button" id="TooltipDemo" class="btn-open-options btn btn-warning">
            <i class="fa fa-cog fa-w-16 fa-spin fa-2x"></i>
          </button>
          <div class="theme-settings__inner">
            <div class="scrollbar-container">
              <div class="theme-settings__options-wrapper">
                <h3 class="themeoptions-heading">Layout Options
                </h3>
                <div class="p-3">
                  <ul class="list-group">
                    <li class="list-group-item">
                      <div class="widget-content p-0">
                        <div class="widget-content-wrapper">
                          <div class="widget-content-left mr-3">
                            <div class="switch has-switch switch-container-class" data-class="fixed-header">
                              <div class="switch-animate switch-on">
                                <input type="checkbox" checked data-toggle="toggle" data-onstyle="success" />
                              </div>
                            </div>
                          </div>
                          <div class="widget-content-left">
                            <div class="widget-heading">Fixed Header
                            </div>
                            <div class="widget-subheading">Makes the header top fixed, always visible!
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li class="list-group-item">
                      <div class="widget-content p-0">
                        <div class="widget-content-wrapper">
                          <div class="widget-content-left mr-3">
                            <div class="switch has-switch switch-container-class" data-class="fixed-sidebar">
                              <div class="switch-animate switch-on">
                                <input type="checkbox" checked data-toggle="toggle" data-onstyle="success" />
                              </div>
                            </div>
                          </div>
                          <div class="widget-content-left">
                            <div class="widget-heading">Fixed Sidebar
                            </div>
                            <div class="widget-subheading">Makes the sidebar left fixed, always visible!
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li class="list-group-item">
                      <div class="widget-content p-0">
                        <div class="widget-content-wrapper">
                          <div class="widget-content-left mr-3">
                            <div class="switch has-switch switch-container-class" data-class="fixed-footer">
                              <div class="switch-animate switch-off">
                                <input type="checkbox" data-toggle="toggle" data-onstyle="success" />
                              </div>
                            </div>
                          </div>
                          <div class="widget-content-left">
                            <div class="widget-heading">Fixed Footer
                            </div>
                            <div class="widget-subheading">Makes the app footer bottom fixed, always visible!
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <h3 class="themeoptions-heading">
                  <div>
                    Header Options
                  </div>
                  <button type="button" class="btn-pill btn-shadow btn-wide ml-auto btn btn-focus btn-sm switch-header-cs-class" data-class="">
                    Restore Default
                  </button>
                </h3>
                <div class="p-3">
                  <ul class="list-group">
                    <li class="list-group-item">
                      <h5 class="pb-2">Choose Color Scheme
                      </h5>
                      <div class="theme-settings-swatches">
                        <div class="swatch-holder bg-primary switch-header-cs-class" data-class="bg-primary header-text-light">
                        </div>
                        <div class="swatch-holder bg-secondary switch-header-cs-class" data-class="bg-secondary header-text-light">
                        </div>
                        <div class="swatch-holder bg-success switch-header-cs-class" data-class="bg-success header-text-dark">
                        </div>
                        <div class="swatch-holder bg-info switch-header-cs-class" data-class="bg-info header-text-dark">
                        </div>
                        <div class="swatch-holder bg-warning switch-header-cs-class" data-class="bg-warning header-text-dark">
                        </div>
                        <div class="swatch-holder bg-danger switch-header-cs-class" data-class="bg-danger header-text-light">
                        </div>
                        <div class="swatch-holder bg-light switch-header-cs-class" data-class="bg-light header-text-dark">
                        </div>
                        <div class="swatch-holder bg-dark switch-header-cs-class" data-class="bg-dark header-text-light">
                        </div>
                        <div class="swatch-holder bg-focus switch-header-cs-class" data-class="bg-focus header-text-light">
                        </div>
                        <div class="swatch-holder bg-alternate switch-header-cs-class" data-class="bg-alternate header-text-light">
                        </div>
                        <div class="divider">
                        </div>
                        <div class="swatch-holder bg-vicious-stance switch-header-cs-class" data-class="bg-vicious-stance header-text-light">
                        </div>
                        <div class="swatch-holder bg-midnight-bloom switch-header-cs-class" data-class="bg-midnight-bloom header-text-light">
                        </div>
                        <div class="swatch-holder bg-night-sky switch-header-cs-class" data-class="bg-night-sky header-text-light">
                        </div>
                        <div class="swatch-holder bg-slick-carbon switch-header-cs-class" data-class="bg-slick-carbon header-text-light">
                        </div>
                        <div class="swatch-holder bg-asteroid switch-header-cs-class" data-class="bg-asteroid header-text-light">
                        </div>
                        <div class="swatch-holder bg-royal switch-header-cs-class" data-class="bg-royal header-text-light">
                        </div>
                        <div class="swatch-holder bg-warm-flame switch-header-cs-class" data-class="bg-warm-flame header-text-dark">
                        </div>
                        <div class="swatch-holder bg-night-fade switch-header-cs-class" data-class="bg-night-fade header-text-dark">
                        </div>
                        <div class="swatch-holder bg-sunny-morning switch-header-cs-class" data-class="bg-sunny-morning header-text-dark">
                        </div>
                        <div class="swatch-holder bg-tempting-azure switch-header-cs-class" data-class="bg-tempting-azure header-text-dark">
                        </div>
                        <div class="swatch-holder bg-amy-crisp switch-header-cs-class" data-class="bg-amy-crisp header-text-dark">
                        </div>
                        <div class="swatch-holder bg-heavy-rain switch-header-cs-class" data-class="bg-heavy-rain header-text-dark">
                        </div>
                        <div class="swatch-holder bg-mean-fruit switch-header-cs-class" data-class="bg-mean-fruit header-text-dark">
                        </div>
                        <div class="swatch-holder bg-malibu-beach switch-header-cs-class" data-class="bg-malibu-beach header-text-light">
                        </div>
                        <div class="swatch-holder bg-deep-blue switch-header-cs-class" data-class="bg-deep-blue header-text-dark">
                        </div>
                        <div class="swatch-holder bg-ripe-malin switch-header-cs-class" data-class="bg-ripe-malin header-text-light">
                        </div>
                        <div class="swatch-holder bg-arielle-smile switch-header-cs-class" data-class="bg-arielle-smile header-text-light">
                        </div>
                        <div class="swatch-holder bg-plum-plate switch-header-cs-class" data-class="bg-plum-plate header-text-light">
                        </div>
                        <div class="swatch-holder bg-happy-fisher switch-header-cs-class" data-class="bg-happy-fisher header-text-dark">
                        </div>
                        <div class="swatch-holder bg-happy-itmeo switch-header-cs-class" data-class="bg-happy-itmeo header-text-light">
                        </div>
                        <div class="swatch-holder bg-mixed-hopes switch-header-cs-class" data-class="bg-mixed-hopes header-text-light">
                        </div>
                        <div class="swatch-holder bg-strong-bliss switch-header-cs-class" data-class="bg-strong-bliss header-text-light">
                        </div>
                        <div class="swatch-holder bg-grow-early switch-header-cs-class" data-class="bg-grow-early header-text-light">
                        </div>
                        <div class="swatch-holder bg-love-kiss switch-header-cs-class" data-class="bg-love-kiss header-text-light">
                        </div>
                        <div class="swatch-holder bg-premium-dark switch-header-cs-class" data-class="bg-premium-dark header-text-light">
                        </div>
                        <div class="swatch-holder bg-happy-green switch-header-cs-class" data-class="bg-happy-green header-text-light">
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <h3 class="themeoptions-heading">
                  <div>Sidebar Options</div>
                  <button type="button" class="btn-pill btn-shadow btn-wide ml-auto btn btn-focus btn-sm switch-sidebar-cs-class" data-class="">
                    Restore Default
                  </button>
                </h3>
                <div class="p-3">
                  <ul class="list-group">
                    <li class="list-group-item">
                      <h5 class="pb-2">Choose Color Scheme
                      </h5>
                      <div class="theme-settings-swatches">
                        <div class="swatch-holder bg-primary switch-sidebar-cs-class" data-class="bg-primary sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-secondary switch-sidebar-cs-class" data-class="bg-secondary sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-success switch-sidebar-cs-class" data-class="bg-success sidebar-text-dark">
                        </div>
                        <div class="swatch-holder bg-info switch-sidebar-cs-class" data-class="bg-info sidebar-text-dark">
                        </div>
                        <div class="swatch-holder bg-warning switch-sidebar-cs-class" data-class="bg-warning sidebar-text-dark">
                        </div>
                        <div class="swatch-holder bg-danger switch-sidebar-cs-class" data-class="bg-danger sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-light switch-sidebar-cs-class" data-class="bg-light sidebar-text-dark">
                        </div>
                        <div class="swatch-holder bg-dark switch-sidebar-cs-class" data-class="bg-dark sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-focus switch-sidebar-cs-class" data-class="bg-focus sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-alternate switch-sidebar-cs-class" data-class="bg-alternate sidebar-text-light">
                        </div>
                        <div class="divider">
                        </div>
                        <div class="swatch-holder bg-vicious-stance switch-sidebar-cs-class" data-class="bg-vicious-stance sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-midnight-bloom switch-sidebar-cs-class" data-class="bg-midnight-bloom sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-night-sky switch-sidebar-cs-class" data-class="bg-night-sky sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-slick-carbon switch-sidebar-cs-class" data-class="bg-slick-carbon sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-asteroid switch-sidebar-cs-class" data-class="bg-asteroid sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-royal switch-sidebar-cs-class" data-class="bg-royal sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-warm-flame switch-sidebar-cs-class" data-class="bg-warm-flame sidebar-text-dark">
                        </div>
                        <div class="swatch-holder bg-night-fade switch-sidebar-cs-class" data-class="bg-night-fade sidebar-text-dark">
                        </div>
                        <div class="swatch-holder bg-sunny-morning switch-sidebar-cs-class" data-class="bg-sunny-morning sidebar-text-dark">
                        </div>
                        <div class="swatch-holder bg-tempting-azure switch-sidebar-cs-class" data-class="bg-tempting-azure sidebar-text-dark">
                        </div>
                        <div class="swatch-holder bg-amy-crisp switch-sidebar-cs-class" data-class="bg-amy-crisp sidebar-text-dark">
                        </div>
                        <div class="swatch-holder bg-heavy-rain switch-sidebar-cs-class" data-class="bg-heavy-rain sidebar-text-dark">
                        </div>
                        <div class="swatch-holder bg-mean-fruit switch-sidebar-cs-class" data-class="bg-mean-fruit sidebar-text-dark">
                        </div>
                        <div class="swatch-holder bg-malibu-beach switch-sidebar-cs-class" data-class="bg-malibu-beach sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-deep-blue switch-sidebar-cs-class" data-class="bg-deep-blue sidebar-text-dark">
                        </div>
                        <div class="swatch-holder bg-ripe-malin switch-sidebar-cs-class" data-class="bg-ripe-malin sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-arielle-smile switch-sidebar-cs-class" data-class="bg-arielle-smile sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-plum-plate switch-sidebar-cs-class" data-class="bg-plum-plate sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-happy-fisher switch-sidebar-cs-class" data-class="bg-happy-fisher sidebar-text-dark">
                        </div>
                        <div class="swatch-holder bg-happy-itmeo switch-sidebar-cs-class" data-class="bg-happy-itmeo sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-mixed-hopes switch-sidebar-cs-class" data-class="bg-mixed-hopes sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-strong-bliss switch-sidebar-cs-class" data-class="bg-strong-bliss sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-grow-early switch-sidebar-cs-class" data-class="bg-grow-early sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-love-kiss switch-sidebar-cs-class" data-class="bg-love-kiss sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-premium-dark switch-sidebar-cs-class" data-class="bg-premium-dark sidebar-text-light">
                        </div>
                        <div class="swatch-holder bg-happy-green switch-sidebar-cs-class" data-class="bg-happy-green sidebar-text-light">
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <h3 class="themeoptions-heading">
                  <div>Main Content Options</div>
                  <button type="button" class="btn-pill btn-shadow btn-wide ml-auto active btn btn-focus btn-sm">Restore Default
                  </button>
                </h3>
                <div class="p-3">
                  <ul class="list-group">
                    <li class="list-group-item">
                      <h5 class="pb-2">Page Section Tabs
                      </h5>
                      <div class="theme-settings-swatches">
                        <div role="group" class="mt-2 btn-group">
                          <button type="button" class="btn-wide btn-shadow btn-primary btn btn-secondary switch-theme-class" data-class="body-tabs-line">
                            Line
                          </button>
                          <button type="button" class="btn-wide btn-shadow btn-primary active btn btn-secondary switch-theme-class" data-class="body-tabs-shadow">
                            Shadow
                          </button>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="app-main">
          <div class="app-sidebar sidebar-shadow">
            <div class="app-header__logo">
              <div class="logo-src"></div>
              <div class="header__pane ml-auto">
                <div>
                  <button type="button" class="hamburger close-sidebar-btn hamburger--elastic" data-class="closed-sidebar">
                    <span class="hamburger-box">
                      <span class="hamburger-inner"></span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div class="app-header__mobile-menu">
              <div>
                <button type="button" class="hamburger hamburger--elastic mobile-toggle-nav">
                  <span class="hamburger-box">
                    <span class="hamburger-inner"></span>
                  </span>
                </button>
              </div>
            </div>
            <div class="app-header__menu">
              <span>
                <button type="button" class="btn-icon btn-icon-only btn btn-primary btn-sm mobile-toggle-header-nav">
                  <span class="btn-icon-wrapper">
                    <i class="fa fa-ellipsis-v fa-w-6"></i>
                  </span>
                </button>
              </span>
            </div>




            <div class="scrollbar-sidebar">
              <div class="app-sidebar__inner">
                <ul class="vertical-nav-menu">
                  <li class="app-sidebar__heading">Dashboards</li>
                  <li>
                    <a href="index.html" class="mm-active">
                      <i class="fa fa-rocket"></i>
                      Dashboard Example 1
                    </a>
                  </li>
                  <li class="app-sidebar__heading">UI Components</li>
                  <li>
                    <a href="/">


                      <i class="fa fa-diamond"></i>


                      Elements
                      <i class="fa fa-angle-down"></i>
                    </a>
                    <ul>
                      <li>
                        <a href="elements-buttons-standard.html">
                          <i class="metismenu-icon"></i>
                          Buttons
                        </a>
                      </li>
                      <li>
                        <a href="elements-dropdowns.html">
                          <i class="metismenu-icon">
                          </i>Dropdowns
                        </a>
                      </li>
                      <li>
                        <a href="elements-icons.html">
                          <i class="metismenu-icon">
                          </i>Icons
                        </a>
                      </li>
                      <li>
                        <a href="elements-badges-labels.html">
                          <i class="metismenu-icon">
                          </i>Badges
                        </a>
                      </li>
                      <li>
                        <a href="elements-cards.html">
                          <i class="metismenu-icon">
                          </i>Cards
                        </a>
                      </li>
                      <li>
                        <a href="elements-list-group.html">
                          <i class="metismenu-icon">
                          </i>List Groups
                        </a>
                      </li>
                      <li>
                        <a href="elements-navigation.html">
                          <i class="metismenu-icon">
                          </i>Navigation Menus
                        </a>
                      </li>
                      <li>
                        <a href="elements-utilities.html">
                          <i class="metismenu-icon">
                          </i>Utilities
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="/">
                      <i class="fa fa-car"></i>
                      Components

                      <i class="fa fa-angle-down"></i>

                    </a>
                    <ul>
                      <li>
                        <a href="components-tabs.html">
                          <i class="metismenu-icon">
                          </i>Tabs
                        </a>
                      </li>
                      <li>
                        <a href="components-accordions.html">
                          <i class="metismenu-icon">
                          </i>Accordions
                        </a>
                      </li>
                      <li>
                        <a href="components-notifications.html">
                          <i class="metismenu-icon">
                          </i>Notifications
                        </a>
                      </li>
                      <li>
                        <a href="components-modals.html">
                          <i class="metismenu-icon">
                          </i>Modals
                        </a>
                      </li>
                      <li>
                        <a href="components-progress-bar.html">
                          <i class="metismenu-icon">
                          </i>Progress Bar
                        </a>
                      </li>
                      <li>
                        <a href="components-tooltips-popovers.html">
                          <i class="metismenu-icon">
                          </i>Tooltips &amp; Popovers
                        </a>
                      </li>
                      <li>
                        <a href="components-carousel.html">
                          <i class="metismenu-icon">
                          </i>Carousel
                        </a>
                      </li>
                      <li>
                        <a href="components-calendar.html">
                          <i class="metismenu-icon">
                          </i>Calendar
                        </a>
                      </li>
                      <li>
                        <a href="components-pagination.html">
                          <i class="metismenu-icon">
                          </i>Pagination
                        </a>
                      </li>
                      <li>
                        <a href="components-scrollable-elements.html">
                          <i class="metismenu-icon">
                          </i>Scrollable
                        </a>
                      </li>
                      <li>
                        <a href="components-maps.html">
                          <i class="metismenu-icon">
                          </i>Maps
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="tables-regular.html">
                      <i class="fa fa-desktop"></i>
                      Tables
                    </a>
                  </li>
                  <li class="app-sidebar__heading">Widgets</li>
                  <li>
                    <a href="dashboard-boxes.html">
                      <i class="fa fa-desktop"></i>
                      Dashboard Boxes
                    </a>
                  </li>
                  <li class="app-sidebar__heading">Forms</li>
                  <li>
                    <a href="forms-controls.html">
                      <i class="fa fa-keyboard-o">
                      </i>Forms Controls
                    </a>
                  </li>
                  <li>
                    <a href="forms-layouts.html">
                      <i class="fa fa-eyedropper">
                      </i>Forms Layouts
                    </a>
                  </li>
                  <li>
                    <a href="forms-validation.html">
                      <i class="fa fa-hdd-o"></i>Forms Validation
                    </a>
                  </li>
                  <li class="app-sidebar__heading">Charts</li>
                  <li>
                    <a href="charts-chartjs.html">
                      <i class="fa fa-line-chart">
                      </i>ChartJS
                    </a>
                  </li>

                </ul>
              </div>
            </div>



          </div>



          <div class="app-main__outer">
            <div class="app-main__inner">
              <div class="app-page-title">
                <div class="page-title-wrapper">
                  <div class="page-title-heading">
                    <div class="page-title-icon">

                      <i class="fa fa-car icon-gradient bg-mean-fruit">
                      </i>
                    </div>
                    <div>Analytics Dashboard
                      <div class="page-title-subheading">This is an example dashboard created using build-in elements and components.
                      </div>
                    </div>
                  </div>
                  <div class="page-title-actions">
                    <button type="button" data-toggle="tooltip" title="Example Tooltip" data-placement="bottom" class="btn-shadow mr-3 btn btn-dark">
                      <i class="fa fa-star"></i>
                    </button>
                    <div class="d-inline-block dropdown">
                      <button type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="btn-shadow dropdown-toggle btn btn-info">
                        <span class="btn-icon-wrapper pr-2 opacity-7">
                          <i class="fa fa-briefcase"></i>
                        </span>
                        Buttons
                      </button>
                      <div tabindex="-1" role="menu" aria-hidden="true" class="dropdown-menu dropdown-menu-right">
                        <ul class="nav flex-column">
                          <li class="nav-item">
                            <a href="/" class="nav-link">
                              <i class="nav-link-icon lnr-inbox"></i>
                              <span>
                                Inbox
                              </span>
                              <div class="ml-auto badge badge-pill badge-secondary">86</div>
                            </a>
                          </li>
                          <li class="nav-item">
                            <a href="/" class="nav-link">
                              <i class="nav-link-icon lnr-book"></i>
                              <span>
                                Book
                              </span>
                              <div class="ml-auto badge badge-pill badge-danger">5</div>
                            </a>
                          </li>
                          <li class="nav-item">
                            <a href="/" class="nav-link">
                              <i class="nav-link-icon lnr-picture"></i>
                              <span>
                                Picture
                              </span>
                            </a>
                          </li>
                          <li class="nav-item">
                            <a disabled href="/" class="nav-link disabled">
                              <i class="nav-link-icon lnr-file-empty"></i>
                              <span>
                                File Disabled
                              </span>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>



<div className="row">
  {/* Card 1: Total Tasks */}
  <div className="col-md-6 col-xl-4">
    <div className="card mb-3 widget-content bg-midnight-bloom">
      <div className="widget-content-wrapper text-white d-flex justify-content-between">
        <div className="widget-content-left">
          <div className="widget-heading">Total Task</div>
          <div className="widget-subheading">Assigned</div>
        </div>
        <div className="widget-content-right">
          <div className="widget-numbers text-white">
            <span>{tasks.length}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Card 2: Total Members */}
  <div className="col-md-6 col-xl-4">
    <div className="card mb-3 widget-content bg-arielle-smile">
      <div className="widget-content-wrapper text-white d-flex justify-content-between">
        <div className="widget-content-left">
          <div className="widget-heading">Total Members</div>
          <div className="widget-subheading">Worker</div>
        </div>
        <div className="widget-content-right">
          <div className="widget-numbers text-white">
            <span>{members.length}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Card 3: Completed Tasks */}
  <div className="col-md-6 col-xl-4">
    <div className="card mb-3 widget-content bg-grow-early">
      <div className="widget-content-wrapper text-white d-flex justify-content-between">
        <div className="widget-content-left">
          <div className="widget-heading">Completed Task</div>
          <div className="widget-subheading">Done</div>
        </div>
        <div className="widget-content-right">
          <div className="widget-numbers text-white">
            <span>
              {tasks.length > 0
                ? `${Math.round((tasks.filter(t => t.status === "Completed").length / tasks.length) * 100)}%`
                : "0%"}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>





              <div class="row">


                <div class="col-md-12 col-lg-6">
                  <div class="mb-3 card">
                    <div class="card-header-tab card-header-tab-animation card-header">
                      <div class="card-header-title">
                        <i class="header-icon lnr-apartment icon-gradient bg-love-kiss"> </i>
                        Sales Report
                      </div>
                      <ul class="nav">
                        <li class="nav-item"><a href="/" class="active nav-link">Last</a></li>
                        <li class="nav-item"><a href="/" class="nav-link second-tab-toggle">Current</a></li>
                      </ul>
                    </div>
                    <div class="card-body">
                      <div class="tab-content">
                        <div class="tab-pane fade show active" id="tabs-eg-77">
                          <div class="card mb-3 widget-chart widget-chart2 text-left w-100">






                            <div class="widget-chat-wrapper-outer">
                              <div class="widget-chart-wrapper widget-chart-wrapper-lg opacity-10 m-0">
                                <canvas id="canvas"></canvas>
                              </div>
                            </div>







                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>



                <div class="col-md-12 col-lg-6">
                  <div class="mb-3 card">
                    <div class="card-header-tab card-header">
                      <div class="card-header-title">
                        <i class="header-icon lnr-rocket icon-gradient bg-tempting-azure"> </i>
                        Bandwidth Reports
                      </div>
                      <div class="btn-actions-pane-right">
                        <div class="nav">
                          <a href="/" class="border-0 btn-pill btn-wide btn-transition active btn btn-outline-alternate">Tab 1</a>
                          <a href="/" class="ml-1 btn-pill btn-wide border-0 btn-transition  btn btn-outline-alternate second-tab-toggle-alt">Tab 2</a>
                        </div>
                      </div>
                    </div>
                    <div class="tab-content">
                      <div class="tab-pane fade active show" id="tab-eg-55">
                        <div class="widget-chart p-3">
                          <div style={{ height: '350px' }}>
                            <canvas id="line-chart"></canvas>
                          </div>
                          <div class="widget-chart-content text-center mt-5">
                            <div class="widget-description mt-0 text-warning">
                              <i class="fa fa-arrow-left"></i>
                              <span class="pl-1">175.5%</span>
                              <span class="text-muted opacity-8 pl-1">increased server resources</span>
                            </div>
                          </div>
                        </div>
                        <div class="pt-2 card-body">
                          <div class="row">
                            <div class="col-md-6">
                              <div class="widget-content">
                                <div class="widget-content-outer">
                                  <div class="widget-content-wrapper">
                                    <div class="widget-content-left">
                                      <div class="widget-numbers fsize-3 text-muted">63%</div>
                                    </div>
                                    <div class="widget-content-right">
                                      <div class="text-muted opacity-6">Generated Leads</div>
                                    </div>
                                  </div>
                                  <div class="widget-progress-wrapper mt-1">
                                    <div class="progress-bar-sm progress-bar-animated-alt progress">
                                      <div class="progress-bar bg-danger" role="progressbar" aria-valuenow="63" aria-valuemin="0" aria-valuemax="100" style={{ width: '63%' }}></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div class="col-md-6">
                              <div class="widget-content">
                                <div class="widget-content-outer">
                                  <div class="widget-content-wrapper">
                                    <div class="widget-content-left">
                                      <div class="widget-numbers fsize-3 text-muted">32%</div>
                                    </div>
                                    <div class="widget-content-right">
                                      <div class="text-muted opacity-6">Submitted Tickers</div>
                                    </div>
                                  </div>
                                  <div class="widget-progress-wrapper mt-1">
                                    <div class="progress-bar-sm progress-bar-animated-alt progress">
                                      <div class="progress-bar bg-success" role="progressbar" aria-valuenow="32" aria-valuemin="0" aria-valuemax="100" style={{ width: '32%' }}></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div class="col-md-6">
                              <div class="widget-content">
                                <div class="widget-content-outer">
                                  <div class="widget-content-wrapper">
                                    <div class="widget-content-left">
                                      <div class="widget-numbers fsize-3 text-muted">71%</div>
                                    </div>
                                    <div class="widget-content-right">
                                      <div class="text-muted opacity-6">Server Allocation</div>
                                    </div>
                                  </div>
                                  <div class="widget-progress-wrapper mt-1">
                                    <div class="progress-bar-sm progress-bar-animated-alt progress">
                                      <div class="progress-bar bg-primary" role="progressbar" aria-valuenow="71" aria-valuemin="0" aria-valuemax="100" style={{ width: '71%' }}></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div class="col-md-6">
                              <div class="widget-content">
                                <div class="widget-content-outer">
                                  <div class="widget-content-wrapper">
                                    <div class="widget-content-left">
                                      <div class="widget-numbers fsize-3 text-muted">41%</div>
                                    </div>
                                    <div class="widget-content-right">
                                      <div class="text-muted opacity-6">Generated Leads</div>
                                    </div>
                                  </div>
                                  <div class="widget-progress-wrapper mt-1">
                                    <div class="progress-bar-sm progress-bar-animated-alt progress">
                                      <div class="progress-bar bg-warning" role="progressbar" aria-valuenow="41" aria-valuemin="0" aria-valuemax="100" style={{ width: '41%' }}></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 col-xl-4">
                  <div class="card mb-3 widget-content">
                    <div class="widget-content-outer">
                      <div class="widget-content-wrapper">
                        <div class="widget-content-left">
                          <div class="widget-heading">Total Orders</div>
                          <div class="widget-subheading">Last year expenses</div>
                        </div>
                        <div class="widget-content-right">
                          <div class="widget-numbers text-success">1896</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6 col-xl-4">
                  <div class="card mb-3 widget-content">
                    <div class="widget-content-outer">
                      <div class="widget-content-wrapper">
                        <div class="widget-content-left">
                          <div class="widget-heading">Products Sold</div>
                          <div class="widget-subheading">Revenue streams</div>
                        </div>
                        <div class="widget-content-right">
                          <div class="widget-numbers text-warning">$3M</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6 col-xl-4">
                  <div class="card mb-3 widget-content">
                    <div class="widget-content-outer">
                      <div class="widget-content-wrapper">
                        <div class="widget-content-left">
                          <div class="widget-heading">Followers</div>
                          <div class="widget-subheading">People Interested</div>
                        </div>
                        <div class="widget-content-right">
                          <div class="widget-numbers text-danger">45,9%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="d-xl-none d-lg-block col-md-6 col-xl-4">
                  <div class="card mb-3 widget-content">
                    <div class="widget-content-outer">
                      <div class="widget-content-wrapper">
                        <div class="widget-content-left">
                          <div class="widget-heading">Income</div>
                          <div class="widget-subheading">Expected totals</div>
                        </div>
                        <div class="widget-content-right">
                          <div class="widget-numbers text-focus">$147</div>
                        </div>
                      </div>
                      <div class="widget-progress-wrapper">
                        <div class="progress-bar-sm progress-bar-animated-alt progress">
                          <div class="progress-bar bg-info" role="progressbar" aria-valuenow="54" aria-valuemin="0" aria-valuemax="100" style={{ width: '54%' }}></div>
                        </div>
                        <div class="progress-sub-label">
                          <div class="sub-label-left">Expenses</div>
                          <div class="sub-label-right">100%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="row">





                <div className="col-md-12">
                  <div className="main-card mb-3 card">
                    <div className="card-header">
                      Active Users
                      <div className="btn-actions-pane-right">
                        <div role="group" className="btn-group-sm btn-group mr-2">
                          <button className="active btn btn-focus">   <a className="active btn btn-focus" href="/add-member">Add Members</a></button>

                        </div>
                      </div>
                    </div>
                    <div className="table-responsive">
                      <table className="align-middle mb-0 table table-borderless table-striped table-hover">
                        <thead>
                          <tr>
                            {/* <th className="text-center">#</th>  */}
                            <th className="text-center">Employee ID</th>
                            <th className="text-center">Profile Picture</th>
                            <th>Name</th>
                            {/* <th className="text-center">Employee ID</th> */}
                            {/* <th className="text-center">Post</th> */}
                            <th className="text-center">Location</th>
                            {/* <th className="text-center">Email</th> */}
                            <th className="text-center">Role</th>
                            {/* <th className="text-center">Date of Joining</th> */}
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((user, index) => (
                            <tr key={index}>
                              <td className="text-center text-muted">{user.EmployeeId}</td>
                              <td className="text-center"> <img
                                width="40"
                                className="rounded-circle"
                                src={user.profile_picture || "https://picsum.photos/100"}
                                Name="widget-heading" alt="" />
                              </td>
                              <td>
                                <div className="widget-content p-0">
                                  <div className="widget-content-wrapper">
                                    <div className="widget-content-left mr-3">

                                      <div className="widget-content-left" >
                                        {user.firstname} {user.lastname} </div>
                                      <div className="widget-subheading opacity-7">{user.email}</div>








                                    </div>
                                  </div>
                                </div>
                              </td>
                              {/* <td className="text-center">{user.EmployeeId}</td>
              <td className="text-center">{user.post}</td> */}
                              <td className="text-center">{user.location}</td>
                              {/* <td className="text-center">{user.email}</td> */}
                              <td className="text-center">





                                <div
                                  className={`badge ${badgeColors[user.post.toLowerCase()] || "badge-dark"}`}
                                >
                                  {user.post}
                                </div>








                              </td>
                              {/* <td className="text-center">
                                {new Date(user.doj).toLocaleDateString()}
                              </td> */}
                              <td className="text-center">
                                <button type="button" className="btn btn-primary btn-sm" onClick={() => setSelectedMember(user)}>
                                  Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="d-block text-center card-footer">
                      <button className="mr-2 btn-icon btn-icon-only btn btn-outline-danger">
                        <i className="fa fa-trash btn-icon-wrapper"></i>
                      </button>
                      <button className="btn-wide btn btn-success">Save</button>
                    </div>
                  </div>
                </div>








                {selectedMember && (
                  <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", padding: "100px" }}>
                    <div className="modal-dialog modal-lg">
                      <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                          <h5 className="modal-title">Member Details</h5>
                          <button type="button" className="btn-close" onClick={() => setSelectedMember(null)}></button>
                        </div>
                        <div className="modal-body" >
                          <div className="text-center mb-3">
                            <img
                              src={selectedMember.profile_picture || "https://picsum.photos/100"}
                              alt="Profile"
                              className="rounded-circle"
                              width="80"
                            />
                          </div>
                          <p><strong>Employee ID:</strong> {selectedMember.EmployeeId}</p>
                          <p><strong>Name:</strong> {selectedMember.firstname} {selectedMember.lastname}</p>
                          <p><strong>Email:</strong> {selectedMember.email}</p>
                          <p><strong>Designation:</strong> {selectedMember.post}</p>
                          <p><strong>Location:</strong> {selectedMember.location}</p>
                          <p><strong>Date of Joining:</strong> {new Date(selectedMember.doj).toLocaleDateString()}</p>



                          <p>
                            <strong>Year of Experience:</strong>{" "}
                            {(() => {
                              const today = new Date();
                              const doj = new Date(selectedMember.doj);
                              const diffInMs = today - doj; // difference in milliseconds
                              const diffInYears = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 365));
                              return diffInYears;
                            })()}
                          </p>

                        </div>
                        <div className="modal-footer">
                          <button className="btn btn-secondary" onClick={() => setSelectedMember(null)}>Close</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}




              </div>
              <div class="row">
                <div class="col-md-6 col-lg-3">
                  <div class="card-shadow-danger mb-3 widget-chart widget-chart2 text-left card">
                    <div class="widget-content">
                      <div class="widget-content-outer">
                        <div class="widget-content-wrapper">
                          <div class="widget-content-left pr-2 fsize-1">
                            <div class="widget-numbers mt-0 fsize-3 text-danger">71%</div>
                          </div>
                          <div class="widget-content-right w-100">
                            <div class="progress-bar-xs progress">
                              <div class="progress-bar bg-danger" role="progressbar" aria-valuenow="71" aria-valuemin="0" aria-valuemax="100" style={{ width: '71%' }}></div>
                            </div>
                          </div>
                        </div>
                        <div class="widget-content-left fsize-1">
                          <div class="text-muted opacity-6">Income Target</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6 col-lg-3">
                  <div class="card-shadow-success mb-3 widget-chart widget-chart2 text-left card">
                    <div class="widget-content">
                      <div class="widget-content-outer">
                        <div class="widget-content-wrapper">
                          <div class="widget-content-left pr-2 fsize-1">
                            <div class="widget-numbers mt-0 fsize-3 text-success">54%</div>
                          </div>
                          <div class="widget-content-right w-100">
                            <div class="progress-bar-xs progress">
                              <div class="progress-bar bg-success" role="progressbar" aria-valuenow="54" aria-valuemin="0" aria-valuemax="100" style={{ width: '54%' }}></div>
                            </div>
                          </div>
                        </div>
                        <div class="widget-content-left fsize-1">
                          <div class="text-muted opacity-6">Expenses Target</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6 col-lg-3">
                  <div class="card-shadow-warning mb-3 widget-chart widget-chart2 text-left card">
                    <div class="widget-content">
                      <div class="widget-content-outer">
                        <div class="widget-content-wrapper">
                          <div class="widget-content-left pr-2 fsize-1">
                            <div class="widget-numbers mt-0 fsize-3 text-warning">32%</div>
                          </div>
                          <div class="widget-content-right w-100">
                            <div class="progress-bar-xs progress">
                              <div class="progress-bar bg-warning" role="progressbar" aria-valuenow="32" aria-valuemin="0" aria-valuemax="100" style={{ width: '32%' }}></div>
                            </div>
                          </div>
                        </div>
                        <div class="widget-content-left fsize-1">
                          <div class="text-muted opacity-6">Spendings Target</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6 col-lg-3">
                  <div class="card-shadow-info mb-3 widget-chart widget-chart2 text-left card">
                    <div class="widget-content">
                      <div class="widget-content-outer">
                        <div class="widget-content-wrapper">
                          <div class="widget-content-left pr-2 fsize-1">
                            <div class="widget-numbers mt-0 fsize-3 text-info">89%</div>
                          </div>
                          <div class="widget-content-right w-100">
                            <div class="progress-bar-xs progress">
                              <div class="progress-bar bg-info" role="progressbar" aria-valuenow="89" aria-valuemin="0" aria-valuemax="100" style={{ width: '89%' }}></div>
                            </div>
                          </div>
                        </div>
                        <div class="widget-content-left fsize-1">
                          <div class="text-muted opacity-6">Totals Target</div>
                        </div>
                      </div>
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












            <div class="app-wrapper-footer">
              <div class="app-footer">
                <div class="app-footer__inner">
                  <div class="app-footer-left">
                    <ul class="nav">
                      <li class="nav-item">
                        <a href="/" class="nav-link">
                          Footer Link 1
                        </a>
                      </li>
                      <li class="nav-item">
                        <a href="/" class="nav-link">
                          Footer Link 2
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div class="app-footer-right">
                    <ul class="nav">
                      <li class="nav-item">
                        <a href="/" class="nav-link">
                          Footer Link 3
                        </a>
                      </li>
                      <li class="nav-item">
                        <a href="/" class="nav-link">
                          <div class="badge badge-success mr-1 ml-0">
                            <small>NEW</small>
                          </div>
                          Footer Link 4
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>












    </div>
















  );
};

export default ManagerDashboard;
