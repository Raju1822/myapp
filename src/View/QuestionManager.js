import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import brand from '../logo.svg';
const API_BASE_URL = 'http://localhost:5000';
export default function QuestionManager() {
  const user = JSON.parse(localStorage.getItem('loggedInUser')) || {};
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(5); // Show 5 questions per page
  const [newQuestion, setNewQuestion] = useState({ text: '', difficulty: 'Easy', options: [{ text: '', is_correct: false }] });
  const [editingQuestion, setEditingQuestion] = useState(null);
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/skills`)
      .then(res => res.json())
      .then(data => setSkills(data));
  }, []);
  useEffect(() => {
    if (selectedSkill) {
      fetch(`${API_BASE_URL}/api/questions/${selectedSkill}`)
        .then(res => res.json())
        .then(data => {
          setQuestions(data);
          setFilteredQuestions(data);
        });
    }
  }, [selectedSkill]);
  // Search filter
  useEffect(() => {
    const filtered = questions.filter(q =>
      q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredQuestions(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm, questions]);
  // Pagination logic
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const addOptionField = () => {
    setNewQuestion(prev => ({ ...prev, options: [...prev.options, { text: '', is_correct: false }] }));
  };
  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index][field] = value;
    setNewQuestion(prev => ({ ...prev, options: updatedOptions }));
  };
  const handleAddQuestion = () => {
    const payload = {
      skill_id: parseInt(selectedSkill),
      question_text: newQuestion.text,
      difficulty: newQuestion.difficulty,
      options: newQuestion.options.map(opt => ({ option_text: opt.text, is_correct: opt.is_correct }))
    };
    fetch(`${API_BASE_URL}/api/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        alert('Question added successfully!');
        setNewQuestion({ text: '', difficulty: 'Easy', options: [{ text: '', is_correct: false }] });
        refreshQuestions();
      });
  };
  const refreshQuestions = () => {
    fetch(`${API_BASE_URL}/api/questions/${selectedSkill}`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setFilteredQuestions(data);
      });
  };
  const handleDeleteQuestion = (id) => {
    fetch(`${API_BASE_URL}/api/questions/${id}`, { method: 'DELETE' })
      .then(() => {
        alert('Question deleted!');
        setQuestions(questions.filter(q => q.question_id !== id));
      });
  };
  const startEditQuestion = (q) => {
    setEditingQuestion({ ...q });
  };
  const handleUpdateQuestion = () => {
    fetch(`${API_BASE_URL}/api/questions/${editingQuestion.question_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_text: editingQuestion.question_text,
        difficulty: editingQuestion.difficulty
      })
    }).then(() => {
      alert('Question updated!');
      setEditingQuestion(null);
      refreshQuestions();
    });
  };
  const handleOptionUpdate = (optionId, text, isCorrect) => {
    fetch(`${API_BASE_URL}/api/options/${optionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option_text: text, is_correct: isCorrect })
    }).then(() => {
      alert('Option updated!');
      refreshQuestions();
    });
  };
  //BAck to dashboard
  const navigate = useNavigate();
  const goback = () => {
    navigate(-1);
  };
  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/');
  };
//Counts of Questions:
// Derived KPIs for the currently selected skill
const totalQuestions = questions.length;
const difficultyCounts = questions.reduce(
  (acc, q) => {
    const key = (q.difficulty || '').toLowerCase(); // 'easy'|'medium'|'hard'
    if (key === 'easy') acc.easy += 1;
    else if (key === 'medium') acc.medium += 1;
    else if (key === 'hard') acc.hard += 1;
    else acc.unknown += 1;
    return acc;
  },
  { easy: 0, medium: 0, hard: 0, unknown: 0 }
);
  return (
    <>
      {user?.role !== "member" ?
        (
          <>
  <div className="min-vh-100 d-flex flex-column bg-light">
    {/* Top Navbar */}
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow">
      <div className="container-fluid">
        <a className="navbar-brand d-flex align-items-center gap-2" href="#!">
          <img
            src={brand}
            alt="Brand"
            width="32"
            height="32"
            className="rounded-circle"
          />
          <span className="fw-semibold">Question Manager</span>
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#qmSidebar"
          aria-controls="qmSidebar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
             <button className="btn btn-danger" onClick={handleLogout}>
                                        <i className="bi bi-box-arrow-right me-1" /> Logout
                                    </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    {/* Layout Row */}
    <div className="container-fluid flex-grow-1">
      <div className="row">
        {/* Sidebar (offcanvas on mobile) */}
        <div
          className="offcanvas offcanvas-start bg-body-tertiary"
          tabIndex="-1"
          id="qmSidebar"
          aria-labelledby="qmSidebarLabel"
          style={{ width: 260 }}
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="qmSidebarLabel">
              <i className="bi bi-layout-sidebar-inset me-2"></i> Menu
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body d-flex flex-column gap-3">
            {/* Skill Selector */}
            <div>
              <label className="form-label fw-semibold">Select Skill</label>
              <select
                className="form-select"
                value={selectedSkill || ''}
                onChange={(e) => setSelectedSkill(e.target.value)}
              >
                <option value="">-- Choose Skill --</option>
                {skills.map((skill) => (
                  <option key={skill.skill_id} value={skill.skill_id}>
                    {skill.skill_name}
                  </option>
                ))}
              </select>
            </div>
            {/* Quick Actions */}
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3">
                <h6 className="fw-semibold mb-2">Quick Actions</h6>
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary btn-sm" onClick={() => setSelectedSkill('')}>
                    <i className="bi bi-arrow-repeat me-1"></i> Reset Skill
                  </button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => goback()}>
                    <i className="bi bi-door-open me-1"></i> Exit Manager
                  </button>
                </div>
              </div>
            </div>
            {/* Help */}
            <div className="small text-muted mt-auto">
              <i className="bi bi-info-circle me-1"></i>
              Use the skill selector to filter questions. Add new questions in the main area.
            </div>
          </div>
        </div>
        {/* Sidebar (static on md+) */}
        <aside className="col-md-3 col-lg-2 d-none d-md-block border-end bg-white" style={{ minHeight: 'calc(100vh - 56px)' }}>
          <div className="p-3">
            <h6 className="fw-semibold mb-3">
              <i className="bi bi-funnel me-1"></i> Filter by Skill
            </h6>
            <select
              className="form-select border-dark mb-3"
              value={selectedSkill || ''}
              onChange={(e) => setSelectedSkill(e.target.value)}
            >
              <option value="">-- Choose Skill --</option>
              {skills.map((skill) => (
                <option key={skill.skill_id} value={skill.skill_id}>
                  {skill.skill_name}
                </option>
              ))}
            </select>
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3">
                <h6 className="fw-semibold mb-2">Quick Actions</h6>
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary btn-sm" onClick={() => setSelectedSkill('')}>
                    <i className="bi bi-arrow-repeat me-1"></i> Reset Skill
                  </button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => goback()}>
                    <i className="bi bi-door-open me-1"></i> Exit Manager
                  </button>
                </div>
              </div>
            </div>
            <div className="small text-muted mt-3">
              <i className="bi bi-info-circle me-1"></i>
              Use the skill selector to filter questions. Add new questions in the main area.
            </div>
          </div>
        </aside>
        {/* Main Content */}
        <main className="col-md-9 col-lg-10 p-3">
          {/* Page Title */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold text-primary mb-0">
              <i className="bi bi-question-circle me-2"></i> Manage Questions
            </h4>
            {/* <button className="btn btn-danger" onClick={handleLogout}>
                                        <i className="bi bi-box-arrow-right me-1" /> Logout
                                    </button> */}
          </div>
{selectedSkill && (
  <div className="row g-2 my-3">
    <div className="col-6 col-lg-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body text-center py-2">
          <div className="d-inline-flex align-items-center justify-content-center rounded-pill bg-primary bg-opacity-10 text-primary mb-1" style={{ width: 32, height: 32 }}>
            <i className="bi bi-collection fs-6"></i>
          </div>
          <div className="text-uppercase text-muted small">Total Questions</div>
          <div className="fw-bold fs-6">{totalQuestions}</div>
        </div>
      </div>
    </div>
    <div className="col-6 col-lg-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body text-center py-2">
          <div className="d-inline-flex align-items-center justify-content-center rounded-pill bg-success bg-opacity-10 text-success mb-1" style={{ width: 32, height: 32 }}>
            <i className="bi bi-emoji-smile fs-6"></i>
          </div>
          <div className="text-uppercase text-muted small">Easy</div>
          <div className="fw-bold fs-6">{difficultyCounts.easy}</div>
        </div>
      </div>
    </div>
    <div className="col-6 col-lg-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body text-center py-2">
          <div className="d-inline-flex align-items-center justify-content-center rounded-pill bg-warning bg-opacity-10 text-warning mb-1" style={{ width: 32, height: 32 }}>
            <i className="bi bi-emoji-neutral fs-6"></i>
          </div>
          <div className="text-uppercase text-muted small">Medium</div>
          <div className="fw-bold fs-6">{difficultyCounts.medium}</div>
        </div>
      </div>
    </div>
    <div className="col-6 col-lg-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body text-center py-2">
          <div className="d-inline-flex align-items-center justify-content-center rounded-pill bg-danger bg-opacity-10 text-danger mb-1" style={{ width: 32, height: 32 }}>
            <i className="bi bi-emoji-frown fs-6"></i>
          </div>
          <div className="text-uppercase text-muted small">Hard</div>
          <div className="fw-bold fs-6">{difficultyCounts.hard}</div>
        </div>
      </div>
    </div>
  </div>
)}
          {/* Add New Question */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-info text-white text-center">
              <i className="bi bi-plus-circle me-2"></i> Add New Question
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-12">
                  <input
                    className="form-control"
                    placeholder="Enter question text"
                    value={newQuestion.text}
                    onChange={(e) => setNewQuestion((prev) => ({ ...prev, text: e.target.value }))}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label mt-2 mb-1">Difficulty</label>
                  <select
                    className="form-select"
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion((prev) => ({ ...prev, difficulty: e.target.value }))}
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>
              {/* Options */}
              <div className="mt-3">
                <h6 className="fw-semibold">Options</h6>
                {newQuestion.options.map((opt, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <input
                      className="form-control me-2"
                      placeholder={`Option ${index + 1}`}
                      value={opt.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    />
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={opt.is_correct}
                        onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                      />
                      <label className="form-check-label">Correct</label>
                    </div>
                  </div>
                ))}
              </div>
              {/* Actions */}
              <div className="d-flex justify-content-between mt-3">
                <button className="btn btn-secondary" onClick={addOptionField}>
                  <i className="bi bi-plus-lg me-1"></i> Add Option
                </button>
                <button className="btn btn-success" onClick={handleAddQuestion}>
                  <i className="bi bi-save me-1"></i> Save Question
                </button>
              </div>
            </div>
          </div>
          {/* Search & List */}
          {selectedSkill && (
            <>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h5 className="mb-0 text-secondary">
                  Questions for{' '}
                  <span className="fw-bold">
                    {skills.find((s) => s.skill_id === selectedSkill)?.skill_name}
                  </span>
                </h5>
                <div className="input-group" style={{ maxWidth: 320 }}>
                  <span className="input-group-text bg-light">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              {/* Questions List */}
              {currentQuestions.map((q) => (
                <div key={q.question_id} className="card mb-3 shadow-sm">
                  <div className="card-body">
                    {editingQuestion && editingQuestion.question_id === q.question_id ? (
                      <>
                        <input
                          className="form-control mb-2"
                          value={editingQuestion.question_text}
                          onChange={(e) =>
                            setEditingQuestion((prev) => ({ ...prev, question_text: e.target.value }))
                          }
                        />
                        <select
                          className="form-select mb-2"
                          value={editingQuestion.difficulty}
                          onChange={(e) =>
                            setEditingQuestion((prev) => ({ ...prev, difficulty: e.target.value }))
                          }
                        >
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Hard</option>
                        </select>
                        <button className="btn btn-primary btn-sm" onClick={handleUpdateQuestion}>
                          <i className="bi bi-check-circle me-1"></i> Save
                        </button>
                        <button className="btn btn-secondary btn-sm ms-2" onClick={() => setEditingQuestion(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <strong>{q.question_text}</strong>{' '}
                            <span className="badge bg-light text-dark">{q.difficulty}</span>
                          </div>
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-warning" onClick={() => startEditQuestion(q)}>
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button className="btn btn-outline-danger" onClick={() => handleDeleteQuestion(q.question_id)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                        <ul className="mt-3 list-unstyled">
                          {q.options.map((opt) => (
                            <li key={opt.option_id} className="mb-2">
                              <input
                                className="form-control d-inline-block w-50 me-2"
                                value={opt.option_text}
                                onChange={(e) =>
                                  handleOptionUpdate(opt.option_id, e.target.value, opt.is_correct)
                                }
                              />
                              <div className="form-check d-inline-block">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={opt.is_correct}
                                  onChange={(e) =>
                                    handleOptionUpdate(opt.option_id, opt.option_text, e.target.checked)
                                  }
                                />
                                <label className="form-check-label">Correct</label>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {/* Pagination */}
              <nav className="mt-3">
                <ul className="pagination justify-content-center">
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => paginate(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </>
          )}
        </main>
      </div>
    </div>
    {/* Footer */}
    <footer className="border-top bg-white mt-auto">
      <div className="container py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2">
        <span className="text-muted small">© {new Date().getFullYear()} Team Productivity</span>
        <div className="d-flex gap-3 small">
          <a href="#!" className="text-decoration-none">Support</a>
          <a href="#!" className="text-decoration-none">Status</a>
          <a href="#!" className="text-decoration-none">Docs</a>
        </div>
      </div>
    </footer>
  </div>
          </>
        ) : (
          <>
            <div className="container my-5">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <i className="bi bi-x-circle-fill text-danger fs-3"></i>
                  <h6 className="mt-2">No Access</h6>
                  <p className="fw-bold">You are not authorized to access this page</p>
                </div>
                <button
                  type="button" className="btn btn-outline-primary m-3"
                  onClick={() => navigate(-1)}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </>
        )}
    </>
  );
}
