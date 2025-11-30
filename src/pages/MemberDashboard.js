
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

  useEffect(() => {
    fetch(`http://localhost:5000/api/user-skills/${user.EmployeeId}`)
      .then((res) => res.json())
      .then((data) => setSkills(data));

    fetch("http://localhost:5000/api/skills")
      .then((res) => res.json())
      .then((data) => setAllSkills(data));
  }, [user.EmployeeId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



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
            src={user?.profile_picture || "https://picsum.photos/100"}
            alt="Profile"
            className="rounded-circle mb-3"
            width="100"
          />
          <h4 className="fw-bold">{user?.firstname} {user?.lastname}</h4>
          <p className="text-muted">{user?.email}</p>
          <span className="badge bg-info">{user?.role}</span>

          <span className="badge bg-danger ml-3 text-white" onClick={handleLogout}> Logout</span>



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






<div className="col-md-12">
  <div className="card shadow-lg border-0">
    <div className="card-header bg-primary text-white text-center">
      <h4 className="mb-0">Your Skills</h4>
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
            <th>Certificate</th>
            <th>Actions</th>
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
                <td>
                  {skill.certificate && skill.certificate.trim() !== "" ? (
                    <a
                      href={skill.certificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      View Certificate
                    </a>
                  ) : (
                    <span className="text-muted small">No certificate</span>
                  )}
                </td>
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
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* Footer with Add Skill Button */}
    <div className="card-footer text-center">
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
</div>









    </div>
  );
};

export default MemberDashboard;





