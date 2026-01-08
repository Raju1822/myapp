import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = 'http://localhost:5000';
const AddMember = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  const [formData, setFormData] = useState({
    EmployeeId: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    post: "",
    location: "",
    doj: "",
    role: "member",
    mapped_to: user.EmployeeId // ✅ Automatically set manager/director ID
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const designations = [
    "Data Analyst", "Software Engineer", "Business Analyst", "Project Manager",
    "UI Designer", "QA Engineer", "DevOps Engineer", "HR Executive",
    "Team Lead", "Scrum Master", "Product Owner", "Data Scientist","Data Engineering Analyst",
    "AI/ML Engineering", "Data Engineering Consultant", "Sr. Software Engineer"
  ];
  const locations = [
    "Gurugram", "Mumbai", "Bangalore", "Delhi", "Hyderabad", "Pune", "Chennai", "Kolkata"
  ];
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (profilePicture) data.append('profile_picture', profilePicture);
      const response = await fetch(`${API_BASE_URL}/api/add-member`, {
        method: "POST",
        body: data
      });
      const result = await response.json();
      if (result.success) {
        alert("✅ Member added successfully!");
        navigate("/manager-dashboard");
      } else {
        alert("❌ Failed: " + result.message);
      }
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Server error occurred.");
    }
  };
  const handleCancel = () => {
    navigate("/manager-dashboard");
  };
  return (
    <div className="container mt-4">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white text-center">
          <h4>Add New Member</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Employee ID */}
            <div className="mb-3">
              <label className="form-label fw-bold">Employee ID</label>
              <input type="text" name="EmployeeId" className="form-control"
                value={formData.EmployeeId} onChange={handleChange} required />
            </div>
            {/* First & Last Name */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">First Name</label>
                <input type="text" name="firstname" className="form-control"
                  value={formData.firstname} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Last Name</label>
                <input type="text" name="lastname" className="form-control"
                  value={formData.lastname} onChange={handleChange} required />
              </div>
            </div>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input type="email" name="email" className="form-control"
                value={formData.email} onChange={handleChange} required />
            </div>
            {/* Password */}
            <div className="mb-3">
              <label className="form-label fw-bold">Password</label>
              <input type="password" name="password" className="form-control"
                value={formData.password} onChange={handleChange} required />
            </div>
            {/* Role Dropdown */}
            <div className="mb-3">
              <label className="form-label fw-bold">Role</label>
              <select name="role" className="form-control"
                value={formData.role} onChange={handleChange} required>
                <option value="member">Member</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            {/* Designation Dropdown */}
            <div className="mb-3">
              <label className="form-label fw-bold">Designation</label>
              <select name="post" className="form-control"
                value={formData.post} onChange={handleChange} required>
                <option value="">Select Designation</option>
                {designations.map((d, index) => (
                  <option key={index} value={d}>{d}</option>
                ))}
              </select>
            </div>
            {/* Location Dropdown */}
            <div className="mb-3">
              <label className="form-label fw-bold">Location</label>
              <select name="location" className="form-control"
                value={formData.location} onChange={handleChange} required>
                <option value="">Select Location</option>
                {locations.map((loc, index) => (
                  <option key={index} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            {/* Date of Joining */}
            <div className="mb-3">
              <label className="form-label fw-bold">Date of Joining</label>
              <input type="date" name="doj" className="form-control"
                value={formData.doj} onChange={handleChange} required />
            </div>
            {/* Profile Picture Upload */}
            <div className="mb-3">
              <label className="form-label fw-bold">Profile Picture</label>
              <input type="file" className="form-control" accept="image/*"
                onChange={handleFileChange} />
            </div>
            {/* Buttons */}
            <div className="d-flex justify-content-between mt-4">
              <button type="submit" className="btn btn-primary px-4">✅ Submit</button>
              <button type="button" className="btn btn-secondary px-4" onClick={handleCancel}>❌ Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AddMember;
