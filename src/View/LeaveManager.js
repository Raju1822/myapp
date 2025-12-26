import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
const LeaveManager = () => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    const [history, setHistory] = useState([]);
    useEffect(() => {
        fetch(`http://localhost:5000/api/leave/history/${user.EmployeeId}`)
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
        fetch("http://localhost:5000/api/leave/types")
            .then(res => res.json())
            .then(data => setLeaveTypes(data))
            .catch(err => console.error("Error fetching leave types:", err));
    }, []);
    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async () => {
        const payload = { ...formData, employee_id: user.EmployeeId };
        const res = await fetch("http://localhost:5000/api/leave/apply", {
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
        fetch(`http://localhost:5000/api/leave/summary/${user.EmployeeId}`)
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
        fetch(`http://localhost:5000/api/holidays}`)
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
        fetch(`http://localhost:5000/api/leave/manager-summary/${user.EmployeeId}`)
            .then(res => res.json())
            .then(data => setSummary2(data));
        fetch(`http://localhost:5000/api/leave/pending/${user.EmployeeId}`)
            .then(res => res.json())
            .then(data => setPendingLeaves(data));
        fetch("http://localhost:5000/api/holidays")
            .then(res => res.json())
            .then(data => setHolidays(data));
    }, [user.EmployeeId]);
    const handleApproveReject = async (status) => {
        const res = await fetch(`http://localhost:5000/api/leave/approve/${selectedLeave.leave_id}`, {
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
            {/* Header */}
            <div className="text-center m-4">
                <h2 className="fw-bold text-primary">Leave Management Dashboard</h2>
                <p className="text-muted">Track your leave details</p>
            </div>
            {/* Profile Card */}
            {user?.role === "member" ? (
                <div className="container">
                    <div className="card shadow-lg mb-4">
                        <div className="row ">
                            <div className="col-md-9 card-body text-left">
                                <h4 className="fw-bold">
                                    <img
                                        src={user?.profile_picture_url || "https://picsum.photos/100"}
                                        alt="Profile"
                                        className="rounded-circle mb-3"
                                        width="100"
                                    />  Hey, {user?.firstname} {user?.lastname} !
                                </h4>
                                {/*
                                <button
                                type="button" class="btn btn-outline-info m-3"
                                onClick={ShowMembers}
                                >
                                {user?.role || 'Members'}
                                </button> */}
                                {/*
                                        <button type="button" class="btn btn-outline-danger" onClick={handleLogout}> Logout</button> */}
                            </div>
                            <div className="col-md-3 card-body text-right">
                                <button
                                    type="button" className="btn btn-outline-warning m-3"
                                    onClick={() => goBack()}
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                        {/* Info Grid */}
                        <div className="row p-4">
                            <div className="col-md-3 mb-3">
                                <div className="card text-center shadow-sm">
                                    <div className="card-body">
                                        <i className="bi bi-calendar-event text-primary fs-3"></i>
                                        <h6 className="mt-2">Total Leave</h6>
                                        <p className="fw-bold">{summary.Count_Leave || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 mb-3">
                                <div className="card text-center shadow-sm">
                                    <div className="card-body">
                                        <i className="bi-check-circle-fill text-success fs-3"></i>
                                        <h6 className="mt-2">Approved Applied</h6>
                                        <p className="fw-bold">{summary.approved_leaves || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 mb-3">
                                <div className="card text-center shadow-sm">
                                    <div className="card-body">
                                        <i className="bi-x-circle-fill text-warning fs-3"></i>
                                        <h6 className="mt-2">Rejected Leave</h6>
                                        <p className="fw-bold">{summary.rejected_leaves || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 mb-3">
                                <div className="card text-center shadow-sm">
                                    <div className="card-body">
                                        <i className="bi bi-clock-fill text-warning fs-3"></i>
                                        <h6 className="mt-2">Pending Leave</h6>
                                        <p className="fw-bold">{summary.pending_leaves || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-6">
                            <div className="table-responsive card shadow p-4 mt-4 ">
                                <h4 className="mb-3">Leave History</h4>
                                <table className="table table-striped ">
                                    <thead>
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
                            {/* <h4 className="mb-3">Available Leaves</h4>
                    <ul className="list-group">
                        {balances.map(b => (
                        <li key={b.leave_type} className="list-group-item d-flex justify-content-between">
                            <span>{b.leave_type}</span>
                            <span className="badge bg-primary">{b.balance}</span>
                        </li>
                        ))}
                    </ul> */}
                            <div className="card shadow p-4 mt-4 table-responsive">
                                <h4 className="mb-3"> Holiday</h4>
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Sr. No.</th>
                                            <th>Type</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {holiday.map(h => (
                                            <tr key={h.holiday_id}>
                                                <td>{h.holiday_id}.</td>
                                                <td className="">{h.description}</td>
                                                <td>{new Date(h.holiday_date).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="col-6 card shadow p-4 mt-4">
                            <form onSubmit={handleSubmit}>
                                <h4 className="mb-3">Apply for Leave</h4>
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
                                <button type="submit" className="btn btn-primary">
                                    Submit Leave Request
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="container">
                    <div className="card shadow-lg m-3">
                        <div className="row">
                            <div className="col-md-9 card-body text-left">
                                <h4 className="fw-bold">
                                    <img
                                        src={user?.profile_picture_url || "https://picsum.photos/100"}
                                        alt="Profile"
                                        className="rounded-circle mb-3"
                                        width="100"
                                    />  Hey, {user?.firstname} {user?.lastname} !
                                </h4>
                                {/*
                                <button
                                type="button" class="btn btn-outline-info m-3"
                                onClick={ShowMembers}
                                >
                                {user?.role || 'Members'}
                                </button> */}
                                {/*
                                        <button type="button" class="btn btn-outline-danger" onClick={handleLogout}> Logout</button> */}
                            </div>
                            <div className="col-md-3 card-body text-right">
                                <button
                                    type="button" className="btn btn-outline-primary m-3"
                                    onClick={() => goBack2()}
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                        {/* Info Grid */}
                        <div className="row p-4">
                            <div className="col-md-3 mb-3">
                                <div className="card text-center shadow-sm">
                                    <div className="card-body">
                                        <i className="bi bi-calendar-event text-primary fs-3"></i>
                                        <h6 className="mt-2">Pending Approval Request</h6>
                                        <p className="fw-bold"> {summary2.pending_requests || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 mb-3">
                                <div className="card text-center shadow-sm">
                                    <div className="card-body">
                                        <i className="bi-check-circle-fill text-success fs-3"></i>
                                        <h6 className="mt-2">Approved Request</h6>
                                        <p className="fw-bold">{summary2.approved_requests || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 mb-3">
                                <div className="card text-center shadow-sm">
                                    <div className="card-body">
                                        <i className="bi-x-circle-fill text-danger fs-3"></i>
                                        <h6 className="mt-2">Rejected Request</h6>
                                        <p className="fw-bold">{summary2.rejected_requests || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 mb-3">
                                <div className="card text-center shadow-sm">
                                    <div className="card-body">
                                        <i className="bi bi-clock-fill text-warning fs-3"></i>
                                        <h6 className="mt-2">Holidays</h6>
                                        <p className="fw-bold">{summary2.total_holidays || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="m-3">
                        {/* Summary */}
                        {/* Pending Requests Table */}
                        <div className="card shadow p-4 mb-4">
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
                                                    className="btn btn-sm btn-primary"
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
                                        <span className="badge bg-info">{new Date(h.holiday_date).toLocaleDateString()}</span>
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