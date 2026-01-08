import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
const API_BASE_URL = 'http://localhost:5000';
const LeaveManager = () => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    const [history, setHistory] = useState([]);
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/leave/history/${user.EmployeeId}`)
            .then(res => res.json())
            .then(data => setHistory(data))
            .catch(err => console.error("Error fetching leave history:", err));
    }, [user]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [formData, setFormData] = useState({
        leave_type_id: "",
        start_date: "",
        end_date: "",
        reason: ""
    });
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/leave/types`)
            .then(res => res.json())
            .then(data => setLeaveTypes(data))
            .catch(err => console.error("Error fetching leave types:", err));
    }, []);
    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async () => {
        const payload = { ...formData, employee_id: user.EmployeeId };
        const res = await fetch(`${API_BASE_URL}/api/leave/apply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        alert(data.message);
        window.location.reload(true);
    };
    const [summary, setSummary] = useState({});
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/leave/summary/${user.EmployeeId}`)
            .then(res => res.json())
            .then(data => setSummary(data))
            .catch(err => console.error("Error fetching summary:", err));
    }, [user.EmployeeId]);
    // const [balances, setBalances] = useState([]);
    // useEffect(() => {
    //     fetch(`http://localhost:5000/api/leave/balance/${user.EmployeeId}`)
    //         .then(res => res.json())
    //         .then(data => setBalances(data))
    //         .catch(err => console.error("Error fetching leave balance:", err));
    // }, [user.EmployeeId]);
    const [holiday, setHoliday] = useState([]);
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/holidays}`)
            .then(res => res.json())
            .then(data => setHoliday(data))
            .catch(err => console.error("Error fetching Holiday List:", err));
    }, []);
    //BAck to dashboard
    const navigate = useNavigate();
    const goBack = () => {
        navigate('/member-dashboard');
    };
    const goBack2 = () => {
        navigate('/manager-dashboard');
    };
    //Manger Leave Requests
    const [summary2, setSummary2] = useState({});
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [holidays, setHolidays] = useState([]);
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/leave/manager-summary/${user.EmployeeId}`)
            .then(res => res.json())
            .then(data => setSummary2(data));
        fetch(`${API_BASE_URL}/api/leave/pending/${user.EmployeeId}`)
            .then(res => res.json())
            .then(data => setPendingLeaves(data));
        fetch(`${API_BASE_URL}/api/holidays`)
            .then(res => res.json())
            .then(data => setHolidays(data));
    }, [user.EmployeeId]);
    const handleApproveReject = async (status) => {
        const res = await fetch(`${API_BASE_URL}/api/leave/approve/${selectedLeave.leave_id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, manager_comments: selectedLeave.manager_comments })
        });
        const data = await res.json();
        alert(data.message);
        setPendingLeaves(pendingLeaves.filter(l => l.leave_id !== selectedLeave.leave_id));
        setSelectedLeave(null);
    };
    return (
        <>

            {user?.role === "member" ?

                (

                    <>

                        {/* Header */}
                        <div className="text-center m-4">
                            <h2 className="fw-bold text-primary">Leave Management Dashboard</h2>
                            <p className="text-muted">Track your leave details</p>
                        </div>

                    </>

                ) : (

                    <>

                        {/* Header */}
                        <div className="text-center m-4">
                            <h2 className="fw-bold text-dark">Leave Management Dashboard</h2>
                            <p className="text-muted">Track your team leave details</p>
                        </div>

                    </>


                )}










            {/* Profile Card */}
            {user?.role === "member" ? (


                <div className="container my-4">
                    {/* Profile Header */}
                    <div className="card shadow-lg border-0 mb-4">
                        <div className="card-header bg-gradient bg-primary text-white d-flex justify-content-between align-items-center rounded-top">
                            <div className="d-flex align-items-center gap-3">
                                <img
                                    src={user?.profile_picture_url || "https://picsum.photos/100"}
                                    alt="Profile"
                                    className="rounded-circle border border-light"
                                    width="80"
                                    height="80"
                                    style={{ objectFit: "cover" }}
                                />
                                <h4 className="fw-bold mb-0">Hey, {user?.firstname} {user?.lastname}!</h4>
                            </div>
                            <button
                                type="button"
                                className="btn btn-light btn-sm"
                                onClick={() => goBack()}
                            >
                                <i className="bi bi-arrow-left me-1"></i> Back
                            </button>
                        </div>

                        {/* Info Grid */}
                        <div className="row p-4 g-3">
                            <div className="col-md-3 col-sm-6">
                                <div className="card text-center shadow-sm border-0 h-100 hover-shadow">
                                    <div className="card-body">
                                        <i className="bi bi-calendar-event text-primary fs-2 mb-2"></i>
                                        <h6 className="text-muted">Total Leave</h6>
                                        <p className="fw-bold fs-5">{summary.Count_Leave || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <div className="card text-center shadow-sm border-0 h-100 hover-shadow">
                                    <div className="card-body">
                                        <i className="bi bi-check-circle-fill text-success fs-2 mb-2"></i>
                                        <h6 className="text-muted">Approved Leaves</h6>
                                        <p className="fw-bold fs-5">{summary.approved_leaves || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <div className="card text-center shadow-sm border-0 h-100 hover-shadow">
                                    <div className="card-body">
                                        <i className="bi bi-x-circle-fill text-danger fs-2 mb-2"></i>
                                        <h6 className="text-muted">Rejected Leaves</h6>
                                        <p className="fw-bold fs-5">{summary.rejected_leaves || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <div className="card text-center shadow-sm border-0 h-100 hover-shadow">
                                    <div className="card-body">
                                        <i className="bi bi-clock-fill text-warning fs-2 mb-2"></i>
                                        <h6 className="text-muted">Pending Leaves</h6>
                                        <p className="fw-bold fs-5">{summary.pending_leaves || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Two-column layout */}
                    <div className="row">
                        {/* Left Column: Tables */}
                        <div className="col-lg-6">
                            {/* Leave History Table */}
                            <div className="card shadow-sm p-4 mb-4">
                                <h4 className="mb-3 text-primary">Leave History</h4>
                                <div className="table-responsive">
                                    <table className="table table-striped align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Type</th>
                                                <th>Start</th>
                                                <th>End</th>
                                                <th>Status</th>
                                                <th>Manager Comments</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map(l => (
                                                <tr key={l.leave_id}>
                                                    <td>{l.leave_type}</td>
                                                    <td>{new Date(l.start_date).toLocaleDateString()}</td>
                                                    <td>{new Date(l.end_date).toLocaleDateString()}</td>
                                                    <td>
                                                        <span
                                                            className={`badge ${l.status === "Approved"
                                                                    ? "bg-success"
                                                                    : l.status === "Rejected"
                                                                        ? "bg-danger"
                                                                        : "bg-warning"
                                                                }`}
                                                        >
                                                            {l.status}
                                                        </span>
                                                    </td>
                                                    <td>{l.manager_comments || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Holiday Table */}
                            <div className="card shadow-sm p-4">
                                <h4 className="mb-3 text-primary">Holidays</h4>
                                <div className="table-responsive">
                                    <table className="table table-striped align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Sr. No.</th>
                                                <th>Description</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {holiday.map(h => (
                                                <tr key={h.holiday_id}>
                                                    <td>{h.holiday_id}</td>
                                                    <td>{h.description}</td>
                                                    <td>{new Date(h.holiday_date).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Apply Leave Form */}
                        <div className="col-lg-6">
                            <div className="card shadow-sm p-4">
                                <h4 className="mb-3 text-primary">Apply for Leave</h4>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Leave Type</label>
                                        <select
                                            className="form-select"
                                            name="leave_type_id"
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Leave Type</option>
                                            {leaveTypes.map(type => (
                                                <option key={type.leave_type_id} value={type.leave_type_id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Start Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="start_date"
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">End Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="end_date"
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Reason</label>
                                        <textarea
                                            className="form-control"
                                            name="reason"
                                            rows="3"
                                            onChange={handleChange}
                                            required
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">
                                        Submit Leave Request
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>





            ) : (
                <div className="container">



                    <div className="card shadow-lg m-3 border-0">
                        {/* Header Section */}
                        <div className="card-header bg-gradient bg-dark text-white d-flex justify-content-between align-items-center rounded-top">
                            <div className="d-flex align-items-center gap-3">
                                <img
                                    src={user?.profile_picture_url || "https://picsum.photos/100"}
                                    alt="Profile"
                                    className="rounded-circle border border-light"
                                    width="80"
                                    height="80"
                                    style={{ objectFit: "cover" }}
                                />
                                <h4 className="fw-bold mb-0">
                                    Hey, {user?.firstname} {user?.lastname}!
                                </h4>

                            </div>
                            <button
                                type="button"
                                className="btn btn-light btn-sm"
                                onClick={() => goBack2()}
                            >
                                <i className="bi bi-arrow-left me-1"></i> Back
                            </button>
                        </div>

                        {/* Info Grid */}
                        <div className="row p-4 g-3">
                            {/* Pending Requests */}
                            <div className="col-md-3 col-sm-6">
                                <div className="card text-center shadow-sm border-0 h-100 hover-shadow">
                                    <div className="card-body">
                                        <i className="bi bi-calendar-event text-primary fs-2 mb-2"></i>
                                        <h6 className="text-muted">Pending Approval</h6>
                                        <p className="fw-bold fs-5">{summary2.pending_requests || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Approved Requests */}
                            <div className="col-md-3 col-sm-6">
                                <div className="card text-center shadow-sm border-0 h-100 hover-shadow">
                                    <div className="card-body">
                                        <i className="bi bi-check-circle-fill text-success fs-2 mb-2"></i>
                                        <h6 className="text-muted">Approved Requests</h6>
                                        <p className="fw-bold fs-5">{summary2.approved_requests || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Rejected Requests */}
                            <div className="col-md-3 col-sm-6">
                                <div className="card text-center shadow-sm border-0 h-100 hover-shadow">
                                    <div className="card-body">
                                        <i className="bi bi-x-circle-fill text-danger fs-2 mb-2"></i>
                                        <h6 className="text-muted">Rejected Requests</h6>
                                        <p className="fw-bold fs-5">{summary2.rejected_requests || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Holidays */}
                            <div className="col-md-3 col-sm-6">
                                <div className="card text-center shadow-sm border-0 h-100 hover-shadow">
                                    <div className="card-body">
                                        <i className="bi bi-clock-fill text-warning fs-2 mb-2"></i>
                                        <h6 className="text-muted">Holidays</h6>
                                        <p className="fw-bold fs-5">{summary2.total_holidays || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>




                    <div className="m-3">
                        {/* Summary */}
                        {/* Pending Requests Table */}
                        <div className=" table-responsive card shadow p-4 mb-4 ">
                            <h4 className="mb-3">Pending Leave Requests</h4>
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Type</th>
                                        <th>Dates</th>
                                        <th>Reason</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingLeaves.map(l => (
                                        <tr key={l.leave_id}>
                                            <td>{l.firstname} {l.lastname}</td>
                                            <td>{l.leave_type}</td>
                                            <td>{new Date(l.start_date).toLocaleDateString()} - {new Date(l.end_date).toLocaleDateString()}</td>
                                            <td>{l.reason}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-dark"
                                                    onClick={() => setSelectedLeave(l)}
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#approveModal"
                                                >
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Holidays */}
                        <div className="card shadow p-4">
                            <h4 className="mb-3">Company Holidays</h4>
                            <ul className="list-group">
                                {holidays.map(h => (
                                    <li key={h.holiday_id} className="list-group-item d-flex justify-content-between">
                                        <span>{h.description}</span>
                                        <span className="badge bg-dark">{new Date(h.holiday_date).toLocaleDateString()}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Approve/Reject Modal */}
                        <div className="modal fade" id="approveModal" tabIndex="-1">
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Approve/Reject Leave</h5>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                                    </div>
                                    <div className="modal-body">
                                        <textarea
                                            className="form-control"
                                            placeholder="Manager Comments"
                                            onChange={e => setSelectedLeave({ ...selectedLeave, manager_comments: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div className="modal-footer">
                                        <button className="btn btn-success" onClick={() => handleApproveReject("Approved")}>Approve</button>
                                        <button className="btn btn-danger" onClick={() => handleApproveReject("Rejected")}>Reject</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
export default LeaveManager;