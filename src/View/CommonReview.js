import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);
const API_BASE_URL = 'http://localhost:5000';
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CommonReview = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('loggedInUser')); // manager/director
    /*--
    ###################################################
    ##############   FOR MANAGER    ###################
    ###################################################
    --*/
    const [employees, setEmployees] = useState([]); // [{ employee_id, employee_name }]
    const [statusMonthly, setStatusMonthly] = useState([]); // rows: employee_id, month, status, review_id
    const [statusYearly, setStatusYearly] = useState([]);   // rows: employee_id, status, review_id, year
    const [questions, setQuestions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        employee_id: '',
        review_type: 'Monthly',
        review_month: null,
        review_year: new Date().getFullYear(),
        comments: '',
        answers: {} // {question_id: rating}
    });
    // Pull questions
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/review-questions`)
            .then(res => res.json())
            .then(qs => setQuestions(qs))
            .catch(err => console.error('Questions load error', err));
    }, []);
    // Pull review status for employees under this manager
    useEffect(() => {
        if (!user?.EmployeeId) return;
        fetch(`${API_BASE_URL}/api/review-status/${user.EmployeeId}`)
            .then(res => res.json())
            .then(payload => {
                // Expect shape like:
                // { employees: [{employee_id, employee_name}], monthly: [...], yearly: [...] }
                const employees = payload.employees || [];
                const monthly = payload.monthly || [];
                const yearly = payload.yearly || [];
                setEmployees(employees);
                setStatusMonthly(monthly);
                setStatusYearly(yearly);
            })
            .catch(err => console.error('Status load error', err));
    }, [user?.EmployeeId]);
    const openMonthlyReview = (employee_id, month, year = new Date().getFullYear()) => {
        setForm({
            employee_id,
            review_type: 'Monthly',
            review_month: month,
            review_year: year,
            comments: '',
            answers: {}
        });
        setShowModal(true);
    };
    const openYearlyReview = (employee_id, year = new Date().getFullYear()) => {
        setForm({
            employee_id,
            review_type: 'Yearly',
            review_month: null,
            review_year: year,
            comments: '',
            answers: {}
        });
        setShowModal(true);
    };
    const setAnswer = (question_id, rating) => {
        setForm(prev => ({ ...prev, answers: { ...prev.answers, [question_id]: Number(rating) } }));
    };
    const submitReview = async (e) => {
        e.preventDefault();
        // build answers array of {question_id, rating}
        const answers = questions.slice(0, 5).map(q => ({
            question_id: q.question_id,
            rating: Number(form.answers[q.question_id] || 0)
        }));
        // basic validation
        if (answers.some(a => a.rating < 1 || a.rating > 5)) {
            alert('Please provide ratings (1-5) for all five questions.');
            return;
        }
        const payload = {
            employee_id: form.employee_id,
            manager_id: user.EmployeeId,
            review_type: form.review_type,
            review_month: form.review_month,
            review_year: form.review_year,
            comments: form.comments,
            answers
        };
        try {
            const res = await fetch(`${API_BASE_URL}/api/add-review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (!result.success) {
                alert(result.message || 'Failed to submit review');
                return;
            }
            alert('Review submitted successfully');
            // refresh status
            const statusRes = await fetch(`${API_BASE_URL}/api/review-status/${user.EmployeeId}`);
            const statusData = await statusRes.json();
            setEmployees(statusData.employees || []);
            setStatusMonthly(statusData.monthly || []);
            setStatusYearly(statusData.yearly || []);
            setShowModal(false);
        } catch (err) {
            console.error('Submit review error', err);
            alert('Server error while submitting review');
        }
    };
    const monthlyGrid = useMemo(() => {
        // group monthly status by employee_id
        const map = new Map();
        statusMonthly.forEach(row => {
            const arr = map.get(row.employee_id) || [];
            arr[row.review_month - 1] = row; // month 1..12 -> index 0..11
            map.set(row.employee_id, arr);
        });
        return map;
    }, [statusMonthly]);
    /*--
    ###################################################
    ##############   FOR MEMBER    ###################
    ###################################################
    --*/
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reviews, setReviews] = useState([]); // array with answers[]
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [typeFilter, setTypeFilter] = useState('All'); // All | Monthly | Yearly
    // Fetch reviews for this employee
    useEffect(() => {
        async function load() {
            if (!user?.EmployeeId) return;
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`${API_BASE_URL}/api/reviews/${user.EmployeeId}`);
                const data = await res.json();
                if (!Array.isArray(data)) {
                    setReviews([]);
                } else {
                    setReviews(data);
                    // If there are reviews for current year, keep it; else pick the latest year from data
                    const years = [...new Set(data.map(r => r.review_year))].sort();
                    if (years.length && !years.includes(selectedYear)) {
                        setSelectedYear(years[years.length - 1]);
                    }
                }
            } catch (e) {
                console.error('Load reviews error', e);
                setError('Unable to load your reviews right now.');
            } finally {
                setLoading(false);
            }
        }
        load();
        // eslint-disable-next-line
    }, [user?.EmployeeId]);
    // Filtered reviews by type/year
    const filtered = useMemo(() => {
        return reviews.filter(r => {
            const typeOk = typeFilter === 'All' ? true : r.review_type === typeFilter;
            const yearOk = r.review_year === selectedYear;
            return typeOk && yearOk;
        });
    }, [reviews, typeFilter, selectedYear]);
    // Helpers
    const isCompleted = (r) => r.status === 'Completed';
    const averageRating = (answers) => {
        if (!answers?.length) return null;
        const sum = answers.reduce((acc, a) => acc + (Number(a.rating) || 0), 0);
        return (sum / answers.length).toFixed(2);
    };
    const formatReviewTitle = (r) => {
        const monthLabel = r.review_type === 'Monthly' && r.review_month ? ` - ${monthNames[r.review_month - 1]}` : '';
        return `${r.review_type}${monthLabel} ${r.review_year}`;
    };
// Chart: Monthly trend for selected year (Completed only)
    const monthlyTrendData = useMemo(() => {
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        const monthlyCompleted = filtered
            .filter(r => r.review_type === 'Monthly' && isCompleted(r))
            .reduce((map, r) => {
                // average rating for that review
                const avg = averageRating(r.answers);
                if (avg !== null) map[r.review_month] = Number(avg);
                return map;
            }, {});
        const dataPoints = months.map(m => monthlyCompleted[m] ?? null);
        return {
            labels: monthNames,
            datasets: [
                {
                    label: 'Avg Rating (Monthly)',
                    data: dataPoints,
                    borderColor: 'rgba(54, 162, 235, 0.9)',
                    backgroundColor: 'rgba(54, 162, 235, 0.3)',
                    tension: 0.25,
                    spanGaps: true,
                },
            ],
        };
    }, [filtered]);
    // Chart: Per-question averages for selected filter/year (Completed only)
    const perQuestionData = useMemo(() => {
        const completed = filtered.filter(isCompleted);
        const qMap = new Map(); // question_id -> { text, sum, count }
        for (const r of completed) {
            for (const a of (r.answers || [])) {
                const entry = qMap.get(a.question_id) || { text: a.question_text, sum: 0, count: 0 };
                entry.sum += Number(a.rating) || 0;
                entry.count += 1;
                qMap.set(a.question_id, entry);
            }
        }
        const entries = Array.from(qMap.entries()).sort(([qa], [qb]) => qa - qb);
        const labels = entries.map(([, v]) => v.text);
        const avgs = entries.map(([, v]) => v.count ? (v.sum / v.count).toFixed(2) : 0);
        return {
            labels,
            datasets: [
                {
                    label: 'Avg Rating by Question',
                    data: avgs,
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                },
            ],
        };
    }, [filtered]);
    // Overall summary
    const overallAvg = useMemo(() => {
        const completed = filtered.filter(isCompleted);
        const ratings = completed.flatMap(r => r.answers?.map(a => Number(a.rating) || 0) || []);
        if (!ratings.length) return null;
        const sum = ratings.reduce((acc, v) => acc + v, 0);
        return (sum / ratings.length).toFixed(2);
    }, [filtered]);
    const latestReview = useMemo(() => {
        if (!filtered.length) return null;
        // sort by year, then month (monthly first)
        const sorted = [...filtered].sort((a, b) => {
            if (a.review_year !== b.review_year) return b.review_year - a.review_year;
            const ma = a.review_month || 0, mb = b.review_month || 0;
            return mb - ma;
        });
        return sorted[0];
    }, [filtered]);
    const handleLogout = () => {
        localStorage.removeItem('loggedInUser');
        navigate('/');
    };
    //-------------------------------------------------------
    return (
        <>
            {user?.role === "member" ?
                (
                    <>
                        <div className="container py-4">
                            {/* Header */}
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="d-flex align-items-center gap-3">
                                    <img
                                        src={user?.profile_picture_url || 'https://avatar.iran.liara.run/public'}
                                        alt="Profile"
                                        width="56"
                                        height="56"
                                        className="rounded-circle"
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <div>
                                        <div className="h5 mb-0">{user?.firstname} {user?.lastname}</div>
                                        <div className="text-muted small">{user?.post} · {user?.location}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                                        <i className="bi bi-arrow-left me-1" /> Back
                                    </button>
                                    <button className="btn btn-danger" onClick={handleLogout}>
                                        <i className="bi bi-box-arrow-right me-1" /> Logout
                                    </button>
                                </div>
                            </div>
                            {/* Filters */}
                            <div className="card mb-3">
                                <div className="card-body d-flex flex-wrap gap-3">
                                    <div>
                                        <label className="form-label mb-0">Review Type</label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={typeFilter}
                                            onChange={e => setTypeFilter(e.target.value)}
                                        >
                                            <option>All</option>
                                            <option>Monthly</option>
                                            <option>Yearly</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label mb-0">Year</label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={selectedYear}
                                            onChange={e => setSelectedYear(Number(e.target.value))}
                                        >
                                            {/* Populate years seen in data, fallback to current year */}
                                            {[...new Set(reviews.map(r => r.review_year))]
                                                .sort()
                                                .map(y => <option key={y} value={y}>{y}</option>)
                                            }
                                            {!reviews.length && <option value={selectedYear}>{selectedYear}</option>}
                                        </select>
                                    </div>
                                    <div className="ms-auto text-muted small">
                                        {loading ? 'Loading…' : error ? <span className="text-danger">{error}</span> : `${filtered.length} record(s)`}
                                    </div>
                                </div>
                            </div>
                            {/* Summary Cards */}
                            <div className="row g-3 mb-3">
                                <div className="col-12 col-md-4">
                                    <div className="card h-100">
                                        <div className="card-body">
                                            <div className="fw-semibold">Overall Average Rating</div>
                                            <div className="display-6">{overallAvg ?? '—'}</div>
                                            <div className="text-muted small">Based on completed reviews in {selectedYear}{typeFilter !== 'All' ? ` (${typeFilter})` : ''}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-4">
                                    <div className="card h-100">
                                        <div className="card-body">
                                            <div className="fw-semibold">Latest Review</div>
                                            {latestReview ? (
                                                <>
                                                    <div>{formatReviewTitle(latestReview)}</div>
                                                    <div className="small text-muted">Status: <span className={`badge ${latestReview.status === 'Completed' ? 'bg-success' : 'bg-warning text-dark'}`}>{latestReview.status}</span></div>
                                                    {latestReview.manager_name && (
                                                        <div className="small text-muted mt-1">By {latestReview.manager_name}</div>
                                                    )}
                                                </>
                                            ) : <div className="text-muted">No reviews yet</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-4">
                                    <div className="card h-100">
                                        <div className="card-body">
                                            <div className="fw-semibold">Completed vs Pending</div>
                                            <div className="h2 mb-0">
                                                {filtered.filter(isCompleted).length} / {filtered.length}
                                            </div>
                                            <div className="text-muted small">Completed in {selectedYear}{typeFilter !== 'All' ? ` (${typeFilter})` : ''}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Charts */}
                            <div className="row g-3 mb-4">
                                <div className="col-12 col-lg-6">
                                    <div className="card h-100">
                                        <div className="card-header">Monthly Trend (Average Rating)</div>
                                        <div className="card-body" style={{ height: 320 }}>
                                            <Line
                                                data={monthlyTrendData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    scales: {
                                                        y: { min: 0, max: 5, ticks: { stepSize: 1 } }
                                                    },
                                                    plugins: {
                                                        legend: { position: 'bottom' },
                                                        tooltip: { mode: 'index', intersect: false }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-6">
                                    <div className="card h-100">
                                        <div className="card-header">Per-Question Averages</div>
                                        <div className="card-body" style={{ height: 320 }}>
                                            <Bar
                                                data={perQuestionData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    scales: {
                                                        y: { min: 0, max: 5, ticks: { stepSize: 1 } }
                                                    },
                                                    plugins: {
                                                        legend: { position: 'bottom' }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Review History */}
                            <div className="card">
                                <div className="card-header">Review History ({selectedYear}{typeFilter !== 'All' ? ` · ${typeFilter}` : ''})</div>
                                <div className="card-body">
                                    {!filtered.length && (
                                        <div className="text-muted">No reviews to show for selected filters.</div>
                                    )}
                                    {filtered.map(r => (
                                        <div key={r.review_id} className="border rounded p-3 mb-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div className="fw-semibold">{formatReviewTitle(r)}</div>
                                                <span className={`badge ${r.status === 'Completed' ? 'bg-success' : 'bg-warning text-dark'}`}>{r.status}</span>
                                            </div>
                                            {r.manager_name && (
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <img
                                                        src={r.manager_profile_picture_url || 'https://avatar.iran.liara.run/public'}
                                                        alt="Manager"
                                                        width="28"
                                                        height="28"
                                                        className="rounded-circle"
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                    <div className="small text-muted">Reviewed by {r.manager_name}</div>
                                                </div>
                                            )}
                                            {r.comments && <div className="mb-2"><strong>Comments:</strong> {r.comments}</div>}
                                            <div className="table-responsive">
                                                <table className="table table-sm table-bordered">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th style={{ width: '70%' }}>Question</th>
                                                            <th className="text-center">Rating</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Array.isArray(r.answers) && r.answers.length > 0 ? (
                                                            r.answers.map(a => (
                                                                <tr key={`${r.review_id}-${a.question_id}`}>
                                                                    <td>{a.question_text}</td>
                                                                    <td className="text-center">{a.rating}/5</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={2} className="text-muted">No ratings recorded (Pending review)</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="container py-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center gap-3">
                                    <img
                                        src={user?.profile_picture_url || 'https://avatar.iran.liara.run/public'}
                                        alt="Profile"
                                        width="56"
                                        height="56"
                                        className="rounded-circle"
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <div>
                                        <div className="h5 mb-0">{user?.firstname} {user?.lastname}</div>
                                        <div className="text-muted small">{user?.post} · {user?.location}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                                        <i className="bi bi-arrow-left me-1" /> Back
                                    </button>
                                    <button className="btn btn-danger" onClick={handleLogout}>
                                        <i className="bi bi-box-arrow-right me-1" /> Logout
                                    </button>
                                </div>
                            </div>
                            {/* Monthly Reviews */}
                            <div className="card mb-4">
                                <div className="card-header">
                                    <strong>Monthly Reviews — {new Date().getFullYear()}</strong>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-sm table-striped align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Employee</th>
                                                    {monthNames.map(m => <th key={m} className="text-center">{m}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {employees.map(emp => {
                                                    const months = monthlyGrid.get(emp.employee_id) || [];
                                                    return (
                                                        <tr key={emp.employee_id}>
                                                            <td> {emp.employee_name}</td>
                                                            {monthNames.map((_, i) => {
                                                                const mRow = months[i];
                                                                const status = mRow?.status || 'Pending';
                                                                const monthNum = i + 1;
                                                                return (
                                                                    <td key={i} className="text-center">
                                                                        {status === 'Completed' ? (
                                                                            <span className="badge bg-success">Done</span>
                                                                        ) : (
                                                                            <button
                                                                                className="btn btn-sm btn-primary"
                                                                                onClick={() => openMonthlyReview(emp.employee_id, monthNum)}
                                                                            >
                                                                                Review
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            {/* Yearly Reviews */}
                            <div className="card">
                                <div className="card-header">
                                    <strong>Yearly Reviews — {new Date().getFullYear()}</strong>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        {employees.map(emp => {
                                            const yr = statusYearly.find(y => y.employee_id === emp.employee_id);
                                            const status = yr?.status || 'Pending';
                                            return (
                                                <div className="col-12 col-md-6 col-lg-4" key={emp.employee_id}>
                                                    <div className="border rounded p-3 h-100 d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <div className="fw-semibold">{emp.employee_name}</div>
                                                            <div className="small text-muted">Status: {status}</div>
                                                        </div>
                                                        {status === 'Completed' ? (
                                                            <span className="badge bg-success">Done</span>
                                                        ) : (
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => openYearlyReview(emp.employee_id)}
                                                            >
                                                                Review
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            {/* Review Modal */}
                            {showModal && (
                                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.5)' }}>
                                    <div className="modal-dialog modal-lg">
                                        <div className="modal-content">
                                            <form onSubmit={submitReview}>
                                                <div className="modal-header">
                                                    <h5 className="modal-title">
                                                        {form.review_type} Review — {form.review_type === 'Monthly' ? monthNames[(form.review_month || 1) - 1] : 'Year'} {form.review_year}
                                                    </h5>
                                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                                </div>
                                                <div className="modal-body">
                                                    <div className="mb-3">
                                                        <label className="form-label">Comments (optional)</label>
                                                        <textarea
                                                            className="form-control"
                                                            rows="2"
                                                            value={form.comments}
                                                            onChange={e => setForm(prev => ({ ...prev, comments: e.target.value }))}
                                                        />
                                                    </div>
                                                    {questions.slice(0, 5).map(q => (
                                                        <div key={q.question_id} className="mb-3">
                                                            <label className="form-label">{q.question_text}</label>
                                                            <select
                                                                className="form-select"
                                                                value={form.answers[q.question_id] || ''}
                                                                onChange={e => setAnswer(q.question_id, e.target.value)}
                                                            >
                                                                <option value="">Select rating</option>
                                                                {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r}</option>)}
                                                            </select>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="modal-footer">
                                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                                    <button type="submit" className="btn btn-primary">Submit Review</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
        </>
    )
};
export default CommonReview;