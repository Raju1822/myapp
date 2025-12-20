
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const API_BASE = 'http://localhost:5000';

export default function UserActions() {
    const { empId: routeEmpId } = useParams();            // From route: /user-action/:empId
    const { state } = useLocation();                      // Optional: navigate(..., { state: { empId } })
    const navigate = useNavigate();

    const manager = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    const empId = routeEmpId || state?.empId;            // Choose whichever is available

    // ---- Employee data (for card + prefills) ----
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [error, setError] = useState(null);

    // ---- Update Profile form state ----
    const [profileForm, setProfileForm] = useState({
        EmployeeId: '',
        firstname: '',
        lastname: '',
        email: '',
        post: '',
        location: '',
        doj: '',            // yyyy-mm-dd
        mapped_to: '',      // managerId
        role: 'member',
        profile_picture: null, // File
    });

    // ---- Transfer form ----
    const [transferForm, setTransferForm] = useState({
        toManagerId: '',
        effectiveDate: '',      // (not used by backend, for your tracking; optional)
    });

    // ---- Prefetch employee ----
    useEffect(() => {
        if (!empId) {
            setError('No EmployeeId provided. Navigate with /user-action/:empId.');
            setLoadingUser(false);
            return;
        }

        (async () => {
            try {
                setLoadingUser(true);
                const res = await fetch(`${API_BASE}/api/user/${empId}`);
                const data = await res.json();

                // Basic validation
                if (!data || !data.EmployeeId) {
                    throw new Error('Employee not found');
                }

                setUser(data);

                // Prefill update form with current data
                setProfileForm({
                    EmployeeId: data.EmployeeId || '',
                    firstname: data.firstname || '',
                    lastname: data.lastname || '',
                    email: data.email || '',
                    post: data.post || '',
                    location: data.location || '',
                    doj: data.doj ? new Date(data.doj).toISOString().slice(0, 10) : '',
                    mapped_to: data.mapped_to || '',
                    role: data.role || 'member',
                    profile_picture: null,
                });

                // Prefill transfer: show current manager and ask for new one
                setTransferForm((prev) => ({
                    ...prev,
                    toManagerId: '',
                    effectiveDate: prev.effectiveDate || '',
                }));
            } catch (e) {
                console.error(e);
                setError(e.message || 'Failed to load employee.');
            } finally {
                setLoadingUser(false);
            }
        })();
    }, [empId]);

    // ---- Update Profile handlers ----
    const onProfileInput = (e) => {
        const { name, value } = e.target;
        setProfileForm((p) => ({ ...p, [name]: value }));
    };
    const onProfileFile = (e) => {
        setProfileForm((p) => ({ ...p, profile_picture: e.target.files?.[0] || null }));
    };


    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const submitUpdateProfile = async (e) => {
        e.preventDefault();

        // Guard against double submit
        if (isSavingProfile) return;
        setIsSavingProfile(true);

        try {
            if (!profileForm.EmployeeId) {
                alert('EmployeeId is required to update profile.');
                return;
            }

            // Build multipart/form-data
            const fd = new FormData();
            Object.entries(profileForm).forEach(([key, val]) => {
                if (key === 'profile_picture') {
                    if (val) fd.append('profile_picture', val); // file
                } else {
                    fd.append(key, val ?? '');
                }
            });

            const res = await fetch('http://localhost:5000/api/update-profile', {
                method: 'POST',
                body: fd, // do NOT set Content-Type; browser sets boundary
            });

            let out;
            try {
                out = await res.json();
            } catch {
                out = { success: false, message: 'Invalid server response' };
            }

            if (!res.ok || out.success === false) {
                alert(out.message || 'Profile update failed');
                return;
            }

            alert(out.message || 'Profile updated successfully!');

            // Update UI (if backend returns updated user)
            if (out.updatedUser) {
                setUser(out.updatedUser);
                setProfileForm((p) => ({
                    ...p,
                    firstname: out.updatedUser.firstname ?? p.firstname,
                    lastname: out.updatedUser.lastname ?? p.lastname,
                    email: out.updatedUser.email ?? p.email,
                    post: out.updatedUser.post ?? p.post,
                    location: out.updatedUser.location ?? p.location,
                    doj: out.updatedUser.doj
                        ? new Date(out.updatedUser.doj).toISOString().slice(0, 10)
                        : p.doj,
                    mapped_to: out.updatedUser.mapped_to ?? p.mapped_to,
                    role: out.updatedUser.role ?? p.role,
                    profile_picture: null, // clear file
                }));
            }

            // Close modal via Bootstrap instance
            const modalEl = document.getElementById('updateProfileModal');
            const modal = window.bootstrap?.Modal.getOrCreateInstance(modalEl);
            modal?.hide();

            // Defensive cleanup for any leftover backdrops/classes
            setTimeout(() => {
                document.querySelectorAll('.modal-backdrop').forEach((bd) => bd.remove());
                document.body.classList.remove('modal-open');
                document.body.style.removeProperty('padding-right');
            }, 120);
        } catch (err) {
            console.error('Update profile error:', err);
            alert(err.message || 'Something went wrong while updating profile.');
        } finally {
            setIsSavingProfile(false);
        }
    };

    // ---- Remove User handlers ----
    const submitRemoveUser = async (e) => {
        e.preventDefault();
        try {
            const typed = document.getElementById('confirmEmpId')?.value?.trim();
            if (typed !== empId) {
                alert('Employee ID does not match. Removal prevented.');
                return;
            }

            const res = await fetch(`${API_BASE}/api/removemember/${empId}`, {
                method: 'DELETE',
            });
            const out = await res.json();

            if (!res.ok || out.success === false) {
                throw new Error(out.message || 'Removal failed');
            }

            alert(out.message || 'Employee removed successfully!');
            window.bootstrap?.Modal.getInstance(document.getElementById('removeUserModal'))?.hide();

            // Optional: redirect the manager to dashboard after removal
            navigate('/manager-dashboard');
        } catch (err) {
            console.error(err);
            alert(err.message || 'Something went wrong.');
        }
    };

    // ---- Transfer Employee handlers ----
    // This uses the update-profile endpoint to set a new mapped_to (new manager),
    // while preserving other fields (we already prefetched user and populated form).



    const [isTransferring, setIsTransferring] = useState(false);

    const submitTransferEmployee = async (e) => {
        e.preventDefault();

        // Basic client-side validation
        const toId = (transferForm.toManagerId || '').trim();
        const fromId = (profileForm.mapped_to || '').trim();
        const empId = user?.EmployeeId;

        if (!empId) {
            alert('Employee ID is missing.');
            return;
        }
        if (!toId) {
            alert('Please enter the destination manager EmployeeId.');
            return;
        }
        if (toId === empId) {
            alert('Destination manager cannot be the same as the employee.');
            return;
        }
        if (isTransferring) return; // guard against double clicks

        setIsTransferring(true);

        try {
            const payload = {
                employee_id: empId,
                from_manager_id: fromId || undefined, // optional safety
                to_manager_id: toId,
            };

            const res = await fetch('http://localhost:5000/api/transfer-employee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            // Try to parse JSON safely
            let out;
            try {
                out = await res.json();
            } catch {
                out = { success: false, message: 'Invalid server response' };
            }

            if (!res.ok || out.success === false) {
                alert(out.message || 'Transfer failed');
                return;
            }

            // Handle idempotent response gracefully
            const msg =
                out.idempotent
                    ? out.message || 'Employee already mapped to this manager.'
                    : out.message || 'Employee transferred successfully!';

            alert(msg);

            // Update local UI state
            if (out.updatedUser) {
                setUser(out.updatedUser);
                setProfileForm((p) => ({ ...p, mapped_to: out.to_manager_id || toId }));
            } else {
                // Fallback: still update mapped_to if backend didn’t return full user
                setProfileForm((p) => ({ ...p, mapped_to: toId }));
            }

            // Reset transfer form (optional)
            setTransferForm({ toManagerId: '', effectiveDate: '' });

            // Properly close the modal and clean backdrops
            const modalEl = document.getElementById('transferEmployeeModal');
            const modal = window.bootstrap?.Modal.getOrCreateInstance(modalEl);
            modal?.hide();

            // Defensive cleanup in case any stray backdrops remain
            // (Sometimes needed with hot-reload or multiple modal instances)
            setTimeout(() => {
                document.querySelectorAll('.modal-backdrop').forEach((bd) => bd.remove());
                document.body.classList.remove('modal-open');
                document.body.style.removeProperty('padding-right');
            }, 120);
        } catch (err) {
            console.error('Transfer error:', err);
            alert(err?.message || 'Something went wrong while transferring.');
        } finally {
            setIsTransferring(false);
        }
    };










    // ---------------- Render ----------------
    if (!empId) {
        return (
            <div className="container py-4">
                <div className="alert alert-warning">No EmployeeId provided. Use route: <code>/user-action/:empId</code>.</div>
            </div>
        );
    }

    if (loadingUser) {
        return (
            <div className="container py-4">
                <div className="spinner-border text-primary" role="status" aria-label="Loading employee" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-4">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            {/* Header */}

            <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-3">
                    <img
                        src={manager?.profile_picture_url || 'https://avatar.iran.liara.run/public'}
                        alt="Profile"
                        width="56"
                        height="56"
                        className="rounded-circle"
                        style={{ objectFit: 'cover' }}
                    />
                    <div>
                        <div className="h5 mb-0">{manager?.firstname} {manager?.lastname}</div>
                        <div className="text-muted small">{manager?.post} · {manager?.location}</div>
                    </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left me-1" /> Back
                    </button>
                    {/* <button className="btn btn-danger" onClick={handleLogout}>
                                        <i className="bi bi-box-arrow-right me-1" /> Logout
                                    </button> */}
                </div>
            </div>




            <hr></hr>
            <div className="my-4">
                {/* <h2 className="h3">Member Page</h2> */}
                <p className="text-muted mb-0">Manage Member profile, removal, and transfer actions.</p>
            </div>







            {/* User card */}


            <div className="card user-card shadow-sm border-0">
                <div className="user-card-accent"></div>

                <div className="card-body">
                    <div className="row g-3">
                        {/* Left: Avatar + Info */}
                        <div className="col-lg-9 col-md-8 d-flex">
                            <img
                                src={user.profile_picture_url || 'https://avatar.iran.liara.run/public'}
                                alt="Profile"
                                className="rounded-circle me-3 border border-2"
                                width="64"
                                height="64"
                                style={{ objectFit: 'cover' }}
                            />
                            <div>
                                <h5 className="fw-semibold mb-1">
                                    {user.firstname} {user.lastname}
                                    <span className="badge bg-secondary-subtle text-secondary ms-2 px-3">
                                        {user.post}
                                    </span>
                                </h5>

                                <ul className="list-unstyled text-muted small mb-0">
                                    <li><i className="bi bi-hash me-2 text-primary"></i><strong>Emp ID:</strong> {user.EmployeeId}</li>
                                    <li><i className="bi bi-envelope me-2 text-primary"></i><strong>Email:</strong> {user.email}</li>
                                    <li><i className="bi bi-geo-alt me-2 text-primary"></i><strong>Location:</strong> {user.location}</li>
                                    <li><i className="bi bi-person-badge me-2 text-primary"></i><strong>Role:</strong> {user.role}</li>
                                    <li><i className="bi bi-diagram-3 me-2 text-primary"></i><strong>Mapped To:</strong> {user.mapped_to || '—'}</li>
                                </ul>
                            </div>
                        </div>

                        {/* Right: Vertical actions */}
                        <div className="col-lg-3 col-md-4">
                            <div className="d-flex flex-column gap-2">
                                <button
                                    className="btn btn-primary w-100"
                                    data-bs-toggle="modal"
                                    data-bs-target="#updateProfileModal"
                                >
                                    <i className="bi bi-pencil-square me-1"></i>
                                    Update Profile
                                </button>

                                <button
                                    className="btn btn-outline-danger w-100"
                                    data-bs-toggle="modal"
                                    data-bs-target="#removeUserModal"
                                >
                                    <i className="bi bi-person-x me-1"></i>
                                    Remove User
                                </button>

                                <button
                                    className="btn btn-warning w-100"
                                    data-bs-toggle="modal"
                                    data-bs-target="#transferEmployeeModal"
                                >
                                    <i className="bi bi-arrow-left-right me-1"></i>
                                    Transfer Employee
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>




            {/* ---------------- Modals ---------------- */}

            {/* Update Profile Modal */}
            <div className="modal fade" id="updateProfileModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <form onSubmit={submitUpdateProfile}>
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="bi bi-pencil-square me-1" /> Update Profile</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                            </div>

                            <div className="modal-body">
                                <div className="row g-3">
                                    {/* Hidden EmployeeId (required by backend) */}
                                    <input type="hidden" name="EmployeeId" value={profileForm.EmployeeId} />

                                    <div className="col-md-6">
                                        <label className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            name="firstname"
                                            className="form-control"
                                            value={profileForm.firstname}
                                            onChange={onProfileInput}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastname"
                                            className="form-control"
                                            value={profileForm.lastname}
                                            onChange={onProfileInput}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control"
                                            value={profileForm.email}
                                            onChange={onProfileInput}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Role</label>
                                        <select
                                            name="role"
                                            className="form-select"
                                            value={profileForm.role}
                                            onChange={onProfileInput}
                                        >
                                            <option value="member">Member</option>
                                            <option value="manager">Manager</option>
                                            <option value="director">Director</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Designation (Post)</label>
                                        <input
                                            type="text"
                                            name="post"
                                            className="form-control"
                                            value={profileForm.post}
                                            onChange={onProfileInput}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            className="form-control"
                                            value={profileForm.location}
                                            onChange={onProfileInput}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Date of Joining</label>
                                        <input
                                            type="date"
                                            name="doj"
                                            className="form-control"
                                            value={profileForm.doj}
                                            onChange={onProfileInput}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Mapped To (Manager ID)</label>
                                        <input
                                            type="text"
                                            name="mapped_to"
                                            className="form-control"
                                            value={profileForm.mapped_to}
                                            onChange={onProfileInput}
                                            placeholder="Manager EmployeeId"
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">Profile Picture</label>
                                        <input
                                            type="file"
                                            name="profile_picture"
                                            className="form-control"
                                            accept="image/*"
                                            onChange={onProfileFile}
                                        />
                                        <div className="form-text">Upload a new picture (optional).</div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Remove User Modal */}
            <div className="modal fade" id="removeUserModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form onSubmit={submitRemoveUser}>
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="bi bi-person-x me-1" /> Remove User</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                            </div>

                            <div className="modal-body">
                                <p className="mb-2">
                                    You are about to remove <strong>{user.firstname} {user.lastname}</strong> (Emp ID: <strong>{user.EmployeeId}</strong>).
                                </p>
                                <p className="text-danger small mb-3">This action may be irreversible. Type the employee ID to confirm.</p>

                                <div className="mb-3">
                                    <label className="form-label">Type Employee ID</label>
                                    <input type="text" className="form-control" id="confirmEmpId" placeholder={user.EmployeeId} required />
                                </div>

                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="archiveCheck" />
                                    <label className="form-check-label" htmlFor="archiveCheck">
                                        Archive user data before removal (if supported)
                                    </label>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" className="btn btn-danger">Remove User</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Transfer Employee Modal */}
            <div className="modal fade" id="transferEmployeeModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form onSubmit={submitTransferEmployee}>
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="bi bi-arrow-left-right me-1" /> Transfer Employee</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                            </div>

                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Current Manager (EmployeeId)</label>
                                    <input type="text" className="form-control" value={profileForm.mapped_to || ''} readOnly />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">To Manager (EmployeeId)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={transferForm.toManagerId}
                                        onChange={(e) => setTransferForm((p) => ({ ...p, toManagerId: e.target.value.trim() }))}
                                        placeholder="Enter new manager EmployeeId"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Effective Date (optional)</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={transferForm.effectiveDate}
                                        onChange={(e) => setTransferForm((p) => ({ ...p, effectiveDate: e.target.value }))}
                                    />
                                    <div className="form-text">Stored locally/UI only in this template; backend doesn’t use it.</div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>




                                <button type="submit" className="btn btn-warning" disabled={isTransferring}>
                                    {isTransferring ? 'Transferring...' : 'Confirm Transfer'}
                                </button>



                            </div>
                        </form>
                    </div>
                </div>
            </div>


        </div>
    );
}














































































// import React, { useEffect, useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';

// const MemberAction = () => {

//     const user = JSON.parse(localStorage.getItem('loggedInUser'));

// const { state } = useLocation();
//   const navigate = useNavigate();

//   // Defensive: redirect if state missing (e.g., opened directly)
//   const empId = state?.empid;
// //   useEffect(() => {
// //     if (!empId){

// //         alert("Member id is not available"); // or show message
// //         navigate(-1);

// //     }

// //   }, [empId, navigate]);


// /**
//  * Minimal React + Bootstrap template for:
//  * - emp card
//  * - 3 action buttons: Update Profile, Remove emp, Transfer Employee
//  * - Each opens its own Bootstrap modal (data-bs attributes)
//  *
//  * Plug in your own functions in the handlers where indicated.
//  */
//  const [emp, setEmp] = useState([]);
//  useEffect(() => {
//      if (empId) {
//        fetch(`http://localhost:5000/api/user/${empId}`)
//          .then(res => res.json())
//          .then(data => {
//            // Handle both shapes: array-only or { success, data }
//            const list = Array.isArray(data) ? data : (data?.data ?? []);
//            setEmp(list);
//          })
//          .catch(err => console.error('Error fetching employees:', err));
//      }
//    }, [empId]);






//   return (
//     <div className="container py-3">



//                    <div className="d-flex align-items-center justify-content-between mb-3">
//                                 <div className="d-flex align-items-center gap-3">
//                                     <img
//                                         src={user?.profile_picture_url || 'https://avatar.iran.liara.run/public'}
//                                         alt="Profile"
//                                         width="56"
//                                         height="56"
//                                         className="rounded-circle"
//                                         style={{ objectFit: 'cover' }}
//                                     />
//                                     <div>
//                                         <div className="h5 mb-0">{user?.firstname} {user?.lastname}</div>
//                                         <div className="text-muted small">{user?.post} · {user?.location}</div>
//                                     </div>
//                                 </div>
//                                 <div className="d-flex align-items-center gap-2">
//                                     <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
//                                         <i className="bi bi-arrow-left me-1" /> Back
//                                     </button>
//                                     {/* <button className="btn btn-danger" onClick={navigate(-1)}>
//                                         <i className="bi bi-box-arrow-right me-1" /> Back
//                                     </button> */}
//                                 </div>
//                             </div>







//     <div className="container py-4">
//       {/* Page header */}
//       <div className="mb-4">
//         <h2 className="h3">Member Page</h2>
//         <p className="text-muted mb-0">Manage Member profile, removal, and transfer actions.</p>
//       </div>

//       {/* User card */}
//       <div className="card shadow-sm">
//         <div className="card-body">
//           <div className="d-flex align-items-center">
//             <img
//               id="empAvatar"
//               src={emp.avatar}
//               alt="Profile"
//               className="rounded-circle me-3"
//               width="56"
//               height="56"
//             />

//             <div className="flex-grow-1">
//               <h5 className="mb-1 d-flex align-items-center">
//                 <span id="empName">{emp.firstname}</span>
//                 <span className="badge bg-secondary ms-2" id="empDesignation">
//                   {emp.designation}
//                 </span>
//               </h5>
//               <div className="text-muted small">
//                 Emp ID: <strong id="empId">{emp.empId}</strong> •{' '}
//                 Email: <strong id="empEmail">{emp.email}</strong> •{' '}
//                 Location: <strong id="empLocation">{emp.location}</strong>
//               </div>
//             </div>

//             <div className="ms-3 d-flex flex-wrap gap-2">
//               <button
//                 className="btn btn-primary"
//                 data-bs-toggle="modal"
//                 data-bs-target="#updateProfileModal"
//               >
//                 <i className="bi bi-pencil-square me-1" />
//                 Update Profile
//               </button>

//               <button
//                 className="btn btn-danger"
//                 data-bs-toggle="modal"
//                 data-bs-target="#removeempModal"
//               >
//                 <i className="bi bi-person-x me-1" />
//                 Remove emp
//               </button>

//               <button
//                 className="btn btn-warning"
//                 data-bs-toggle="modal"
//                 data-bs-target="#transferEmployeeModal"
//               >
//                 <i className="bi bi-arrow-left-right me-1" />
//                 Transfer Employee
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ---------------- Modals ---------------- */}

//       {/* Update Profile Modal */}
//       <div className="modal fade" id="updateProfileModal" tabIndex="-1" aria-hidden="true">
//         <div className="modal-dialog modal-lg modal-dialog-centered">
//           <div className="modal-content">
//             <form onSubmit={handleSaveProfile}>
//               <div className="modal-header">
//                 <h5 className="modal-title">
//                   <i className="bi bi-pencil-square me-1" />
//                   Update Profile
//                 </h5>
//                 <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
//               </div>

//               <div className="modal-body">
//                 <div className="row g-3">
//                   <div className="col-md-6">
//                     <label className="form-label">Full Name</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       name="name"
//                       value={profileForm.name}
//                       onChange={handleProfileChange}
//                       required
//                     />
//                   </div>

//                   <div className="col-md-6">
//                     <label className="form-label">Email</label>
//                     <input
//                       type="email"
//                       className="form-control"
//                       name="email"
//                       value={profileForm.email}
//                       onChange={handleProfileChange}
//                       required
//                     />
//                   </div>

//                   <div className="col-md-6">
//                     <label className="form-label">Location</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       name="location"
//                       value={profileForm.location}
//                       onChange={handleProfileChange}
//                     />
//                   </div>

//                   <div className="col-md-6">
//                     <label className="form-label">Designation</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       name="designation"
//                       value={profileForm.designation}
//                       onChange={handleProfileChange}
//                     />
//                   </div>

//                   <div className="col-12">
//                     <label className="form-label">Profile Picture URL</label>
//                     <input
//                       type="url"
//                       className="form-control"
//                       name="avatar"
//                       value={profileForm.avatar}
//                       onChange={handleProfileChange}
//                       placeholder="https://..."
//                     />
//                     <div className="form-text">Provide a public image URL or leave blank.</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="modal-footer">
//                 <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn btn-primary">
//                   Save Changes
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>

//       {/* Remove emp Modal */}
//       <div className="modal fade" id="removeempModal" tabIndex="-1" aria-hidden="true">
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content">
//             <form onSubmit={handleRemoveemp}>
//               <div className="modal-header">
//                 <h5 className="modal-title">
//                   <i className="bi bi-person-x me-1" />
//                   Remove emp
//                 </h5>
//                 <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
//               </div>

//               <div className="modal-body">
//                 <p className="mb-2">
//                   You are about to remove emp <strong>{emp.name}</strong> (Emp ID:{' '}
//                   <strong>{emp.empId}</strong>).
//                 </p>
//                 <p className="text-danger small mb-3">
//                   This action may be irreversible. Please confirm by typing the employee ID.
//                 </p>

//                 <div className="mb-3">
//                   <label className="form-label">Type Employee ID to confirm</label>
//                   <input type="text" className="form-control" id="confirmEmpId" placeholder={emp.empId} required />
//                 </div>

//                 <div className="form-check">
//                   <input className="form-check-input" type="checkbox" id="archiveCheck" />
//                   <label className="form-check-label" htmlFor="archiveCheck">
//                     Archive emp data before removal
//                   </label>
//                 </div>
//               </div>

//               <div className="modal-footer">
//                 <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn btn-danger">
//                   Remove emp
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>

//       {/* Transfer Employee Modal */}
//       <div className="modal fade" id="transferEmployeeModal" tabIndex="-1" aria-hidden="true">
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content">
//             <form onSubmit={handleTransferEmployee}>
//               <div className="modal-header">
//                 <h5 className="modal-title">
//                   <i className="bi bi-arrow-left-right me-1" />
//                   Transfer Employee
//                 </h5>
//                 <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
//               </div>

//               <div className="modal-body">
//                 <div className="mb-3">
//                   <label className="form-label">From Manager (Employee ID)</label>
//                   <input type="text" className="form-control" id="fromManagerId" placeholder="M1001" required />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">To Manager (Employee ID)</label>
//                   <input type="text" className="form-control" id="toManagerId" placeholder="M2002" required />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">Effective Date</label>
//                   <input type="date" className="form-control" id="effectiveDate" required />
//                 </div>
//                 <div className="form-check">
//                   <input className="form-check-input" type="checkbox" id="notifyempCheck" defaultChecked />
//                   <label className="form-check-label" htmlFor="notifyempCheck">
//                     Notify emp via email
//                   </label>
//                 </div>
//               </div>

//               <div className="modal-footer">
//                 <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn btn-warning">
//                   Confirm Transfer
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>

















//     </div>
//   );


// };

// export default MemberAction;