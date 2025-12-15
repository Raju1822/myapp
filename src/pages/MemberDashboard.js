
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";






const MemberDashboard = () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };



  const [skills, setSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [formData, setFormData] = useState({
    skill_id: "",
    proficiency_percent: "",
    certificate: "",
    years_of_experience: ""
  });

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/user-skills/${user.EmployeeId}`)
      .then((res) => res.json())
      .then((data) => setSkills(data));

    fetch("http://localhost:5000/api/skills")
      .then((res) => res.json())
      .then((data) => setAllSkills(data));

    fetch(`http://localhost:5000/api/tasks/${user.EmployeeId}`)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error("Error fetching tasks:", err));

  }, [user.EmployeeId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const [manager, setManager] = useState([]);
  useEffect(() => {
    fetch(`http://localhost:5000/api/manager/${user.EmployeeId}`)
      .then((res) => res.json())
      .then((data) => setManager(data));

  });


  //Handle edit and add skills
  const handleAddSkill = async (e) => {
    e.preventDefault();
    const payload = { ...formData, employee_id: user.EmployeeId };

    const url = isEditing
      ? "http://localhost:5000/api/update-skill"
      : "http://localhost:5000/api/add-skill";

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    alert(result.message);
    setIsEditing(false);
    window.location.reload();
  };




  //Edit and delete skills

  const [isEditing, setIsEditing] = useState(false);

  const handleEditSkill = (skill) => {
    // Pre-fill form with skill data for editing
    setFormData({
      skill_id: skill.skill_id,
      proficiency_percent: skill.proficiency_percent,
      certificate: skill.certificate,
      years_of_experience: skill.years_of_experience
    });
    setIsEditing(true); // Add a state to toggle edit mode
  };




  const handleDeleteSkill = async (skill) => {


    if (window.confirm(`Are you sure you want to delete ${skill.skill_name}?`)) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/delete-skill/${user.EmployeeId}/${skill.skill_name}`,
          {
            method: "DELETE",
          }
        );

        // ✅ Check if response is OK
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        // ✅ Parse JSON only if response has body
        const result = await response.text(); // Use text first
        const data = result ? JSON.parse(result) : { message: "Deleted" };

        alert(data.message);
        window.location.reload();

        // ✅ Update state without reload
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete skill. Please try again.");
      }
    }
  };







  // Update task status
  const updateTaskStatus = async (taskId, status) => {
    const progress = status === "Completed" ? 100 : status === "In Progress" ? 50 : 0;
    try {
      await fetch(`http://localhost:5000/api/update-task-status/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, progress_percent: progress })
      });
      // Update UI without reload
      setTasks(tasks.map(t => t.task_id === taskId ? { ...t, status, progress_percent: progress } : t));
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task status.");
    }
  };


  //Show Members hierarchy

const [members, setMembers] = useState([]);


const ShowMembers = async () => {
  if (!user?.EmployeeId) return;
  try {
    const res = await fetch(`http://localhost:5000/api/directmembers/${user.mapped_to}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data?.data || []);
    setMembers(list);

    // Show Bootstrap modal
    const modal = new window.bootstrap.Modal(document.getElementById('membersModal'));
    modal.show();
  } catch (err) {
    console.error('Error fetching members:', err);
    setMembers([]);
  }
};




//Take Exam

const handleTakeExam = (skill) => {
  if (!skill?.skill_id) {
    alert('Skill id is missing. Please update your /api/user-skills query to include s.skill_id.');
    return;
  }
  navigate('/skill-exam', {
    state: { skillId: skill.skill_id, skillName: skill.skill_name }
  });
};


const [selectedCertificate, setSelectedCertificate] = useState(null);

const handleLeave = () => {
   
    navigate("/LeaveManager");
  };


  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary">Welcome to Your Dashboard</h2>
        <p className="text-muted">Track your details and productivity metrics</p>
      </div>

      {/* Profile Card */}
      <div className="card shadow-lg mb-4">
        <div className="card-body text-center">
          <img
            src={user?.profile_picture_url || "https://picsum.photos/100"}
            alt="Profile"
            className="rounded-circle mb-3"
            width="100"
          />
          <h4 className="fw-bold">{user?.firstname} {user?.lastname}</h4>
          <p className="text">{user?.email}</p>
          {/* <button className="btn badge btn-primary ml-3 text-white" onClick={ShowMembers}>{user?.role}</button> */}





<button
  type="button" class="btn btn-outline-info m-3"
  onClick={ShowMembers}
>
  {user?.role || 'Members'}
</button>





<div className="modal fade" id="membersModal" tabIndex="-1" aria-hidden="true">
  <div className="modal-dialog modal-dialog-centered modal-lg">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Team Members of {user?.firstname} {user?.lastname}</h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>


      {/* <div className="modal-body">
        {members.length === 0 ? (
          <p>No members found.</p>
        ) : (
          <ul className="list-group">
            {members.map(m => (
              <li key={m.EmployeeId} className="list-group-item d-flex align-items-center">
                <img
                  src={m.profile_picture
                    ? `http://localhost:5000/uploads/${encodeURIComponent(m.profile_picture)}`
                    : 'https://avatar.iran.liara.run/public'}
                  alt="Profile"
                  class ="rounded-circle me-2"
                  width="40"
                  height="40"
                />
                <div>
                  <strong>{m.firstname} {m.lastname}</strong><br />
                  <small>{m.role} · {m.post}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div> */}


      
<div className="modal-body">
  {members.length === 0 ? (
    <p className="text-muted">No members found.</p>
  ) : (
    <div className="text-center">
      {/* Manager node */}
      <div className="d-inline-flex align-items-center gap-2 p-2 border rounded bg-light">
        <img
          src={
            manager[0]?.profile_picture
              ? `http://localhost:5000/uploads/${encodeURIComponent(user.profile_picture)}`
              : 'https://avatar.iran.liara.run/public'
          }
          alt="Manager"
          className="rounded-circle"
          width="40"
          height="40"
          style={{ objectFit: 'cover' }}
        />
        <div className="text-start">
          <div className="fw-semibold">{manager[0]?.firstname} {manager[0]?.lastname}</div>
          <div className="text-muted small">{manager[0]?.role} · {manager[0]?.post}</div>
        </div>
      </div>

      {/* Connector line */}
      <div className="mx-auto my-2" style={{ width: 2, height: 16, background: '#dee2e6' }} />

      {/* Direct reports row */}
      <div className="row g-3 justify-content-center">
        {members.map(m => (
          <div key={m.EmployeeId} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <img
                    src={
                      m.profile_picture
                        ? `http://localhost:5000/uploads/${encodeURIComponent(m.profile_picture)}`
                        : 'https://avatar.iran.liara.run/public'
                    }
                    alt="Profile"
                    className="rounded-circle"
                    width="36"
                    height="36"
                    style={{ objectFit: 'cover' }}
                  />
                  <div>
                    <div className="fw-semibold small">{m.firstname} {m.lastname}</div>
                    <div className="text-muted small"> {m.post}</div>
                  </div>
                </div>

                {/* Optional meta row
                {m.location && <div className="text-muted small">📍 {m.location}</div>}
                {m.doj && (
                  <div className="text-muted small">
                    🗓 Joined: {new Date(m.doj).toLocaleDateString()}
                  </div>
                )} */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}
</div>




    </div>
  </div>
</div>











          <button type="button" class="btn btn-outline-danger" onClick={handleLogout}> Logout</button>



        </div>


      </div>

      {/* Info Grid */}
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <i className="bi bi-briefcase-fill text-primary fs-3"></i>
              <h6 className="mt-2">Designation</h6>
              <p className="fw-bold">{user?.post}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <i className="bi bi-geo-alt-fill text-success fs-3"></i>
              <h6 className="mt-2">Location</h6>
              <p className="fw-bold">{user?.location}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <i className="bi bi-calendar-check-fill text-warning fs-3"></i>
              <h6 className="mt-2">Date of Joining</h6>
              <p className="fw-bold">{new Date(user?.doj).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Year of Experience */}
      <div className="card shadow-sm mb-4">
        <div className="card-body text-center">
          <h6 className="fw-bold">Years of Experience</h6>
          <p className="fs-4 text-primary">
            {(() => {
              const today = new Date();
              const doj = new Date(user?.doj);
              const diffInMs = today - doj;
              return Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 365));
            })()} Years
          </p>
        </div>
      </div>










      {/* Skills Section */}
      <div className="row">


        {/* <div className="col-md-6">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white text-center">
              <h4 className="mb-0">Your Skills</h4>
            </div>

            <ul className="list-group">
              {skills.map((skill, index) => {
                let barColor = "bg-danger";
                if (skill.proficiency_percent >= 80) barColor = "bg-success";
                else if (skill.proficiency_percent >= 50) barColor = "bg-warning";

                return (
                  <li key={index} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold">{skill.skill_name}</span>
                      <span>{skill.proficiency_percent}%</span>
                    </div>

                    <div className="progress mb-2" style={{ height: "8px" }}>
                      <div
                        className={`progress-bar ${barColor}`}
                        role="progressbar"
                        style={{ width: `${skill.proficiency_percent}%` }}
                        aria-valuenow={skill.proficiency_percent}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>

                    {skill.certificate && skill.certificate.trim() !== "" ? (
                      <a
                        href={skill.certificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary w-100"
                      >
                        View Certificate
                      </a>
                    ) : (
                      <span className="text-muted small">No certificate available</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div> */}














      </div>







      <div className="card shadow-lg border-0">
        <div className="card-header bg-primary text-white text-center">
          <h4 className="mb-0">Your Skills</h4>







          <div className="btn-actions-pane-right">
            <div role="group" className="btn-group-sm btn-group mr-2">

              <button
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#skillModal"
                onClick={() => {
                  setFormData({
                    skill_id: "",
                    proficiency_percent: "",
                    certificate: "",
                    years_of_experience: ""
                  });
                  setIsEditing(false);
                }}
              >
                <i className="bi bi-plus-circle me-2"></i> Add Skill
              </button>

            </div>
          </div>



        </div>

        {/* Skills Table */}
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-primary">
              <tr>
                <th>#</th>
                <th>Skill Name</th>
                <th>Proficiency</th>
                <th>Progress</th>
                <th className="text-center">Certificate</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill, index) => {
                let barColor = "bg-danger";
                if (skill.proficiency_percent >= 80) barColor = "bg-success";
                else if (skill.proficiency_percent >= 50) barColor = "bg-warning";

                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td className="fw-bold">{skill.skill_name}</td>
                    <td>{skill.proficiency_percent}%</td>
                    <td style={{ width: "150px" }}>
                      <div className="progress" style={{ height: "8px" }}>
                        <div
                          className={`progress-bar ${barColor}`}
                          role="progressbar"
                          style={{ width: `${skill.proficiency_percent}%` }}
                          aria-valuenow={skill.proficiency_percent}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </td>




                    
<td className="text-center">
  {skill.certificate && skill.certificate.trim() !== "" ? (
    <>
      <button
        className="btn btn-sm btn-outline-primary"
        data-bs-toggle="modal"
        data-bs-target="#certificateModal"
        onClick={() => setSelectedCertificate(skill.certificate)}
      >
        View Certificate
      </button>
    </>
  ) : (
    <span className="text-muted small">No certificate</span>
  )}
</td>




                    {/* <td>
                      <div className="d-flex justify-content-between">
                        <button
                          className="btn btn-sm btn-outline-warning"
                          data-bs-toggle="modal"
                          data-bs-target="#skillModal"
                          onClick={() => handleEditSkill(skill)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteSkill(skill)}
                        >
                          Delete
                        </button>
                      </div>
                    </td> */}





                    
<td>
  <div className="d-flex justify-content-between">
    <button
      className="btn btn-sm btn-outline-warning"
      data-bs-toggle="modal"
      data-bs-target="#skillModal"
      onClick={() => handleEditSkill(skill)}
    >
      Edit
    </button>
    <button
      className="btn btn-sm btn-outline-danger"
      onClick={() => handleDeleteSkill(skill)}
    >
      Delete
    </button>
    <button
      className="btn btn-sm btn-outline-primary"
      onClick={() => handleTakeExam(skill)}
      title="Take Exam"
    >
      Take Exam
    </button>
  </div>
</td>








                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>



<div
  className="modal fade"
  id="certificateModal"
  tabIndex="-1"
  aria-labelledby="certificateModalLabel"
  aria-hidden="true"
>
  <div className="modal-dialog modal-lg">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title" id="certificateModalLabel">Certificate Preview</h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div className="modal-body">
        {selectedCertificate ? (
          
<iframe title="Certificate"
  src={`https://docs.google.com/viewer?url=${selectedCertificate}&embedded=true`}
  style={{ width: '100%', height: '500px', border: 'none' }}
></iframe>

        ) : (
          <p>No certificate selected</p>
        )}
      </div>
      <div className="modal-footer">
        {selectedCertificate && (
          <a
            href={selectedCertificate}
            download
            className="btn btn-success"
          >
            Download
          </a>
        )}
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>




        {/* Footer with Add Skill Button */}
        <div className="card-footer text-center">
          <br></br>
        </div>
      </div>

      {/* Bootstrap Modal */}
      <div
        className="modal fade"
        id="skillModal"
        tabIndex="-1"
        aria-labelledby="skillModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="skillModalLabel">
                {isEditing ? "Update Skill" : "Add Skill"}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddSkill}>
                {/* Skill Dropdown */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Select Skill</label>
                  <select
                    name="skill_id"
                    className="form-control"
                    value={formData.skill_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Choose a Skill --</option>
                    {allSkills.map((skill) => (
                      <option key={skill.skill_id} value={skill.skill_id}>
                        {skill.skill_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Proficiency */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Proficiency (%)</label>
                  <input
                    type="number"
                    name="proficiency_percent"
                    className="form-control"
                    value={formData.proficiency_percent}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    placeholder="Enter proficiency (0-100)"
                    required
                  />
                </div>

                {/* Certificate URL */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Certificate URL</label>
                  <input
                    type="url"
                    name="certificate"
                    className="form-control"
                    value={formData.certificate}
                    onChange={handleChange}
                    placeholder="Paste certificate link"
                  />
                </div>

                {/* Years of Experience */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Years of Experience</label>
                  <input
                    type="number"
                    name="years_of_experience"
                    className="form-control"
                    value={formData.years_of_experience}
                    onChange={handleChange}
                    placeholder="Enter years of experience"
                  />
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn btn-primary w-100">
                  <i className="bi bi-check-circle me-2"></i>
                  {isEditing ? "Update Skill" : "Add Skill"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>







      <div className="card shadow-sm p-4 mt-4">
        <h5 className="fw-bold text-primary mb-3">Your Tasks</h5>
        <div className="row">
          {tasks.length === 0 ? (
            <p>No tasks assigned yet.</p>
          ) : (
            tasks.map(task => (
              <div className="col-md-4 mb-3" key={task.task_id}>
                <div className="card p-3 shadow-sm border">
                  <h6 className="fw-bold">#00{task.task_id}</h6>
                  <h6 className="fw-bold">{task.title}</h6>
                  <p>{task.description}</p>
                  <p><strong>Due:</strong> {new Date(task.due_date).toLocaleDateString()}</p>
                  <span className={`badge ${task.priority === "High" ? "bg-danger" : task.priority === "Medium" ? "bg-warning" : "bg-success"}`}>
                    {task.priority}
                  </span>
                  <div className="progress mt-2 mb-2">
                    <div
                      className="progress-bar"
                      style={{ width: `${task.progress_percent}%` }}
                    >
                      {task.progress_percent}%
                    </div>
                  </div>
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.task_id, e.target.value)}
                    className="form-select"
                  >
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>






 <div className="card shadow-sm p-4 mt-4">
        <h5 className="fw-bold text-primary mb-3">Leave Management</h5>



         <div className="btn-actions-pane-right">
            <div role="group" className="btn-group-sm btn-group mr-2">

              <button
                className="btn btn-primary"
             
               onClick = {handleLeave}
              >
                <i className="bi bi-plus-circle me-2"></i> Apply Leave
              </button>

            </div>
          </div>

      <div className="row">
        <div className="col-md-6 mb-4">
         
        </div>
        <div className="col-md-6 mb-4">
          
        </div>
      </div>
      
    </div>




    </div>
  );
};

export default MemberDashboard;





