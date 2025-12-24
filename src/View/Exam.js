
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Exam() {
  // -----------------------------
  // Context & Route State
  // -----------------------------
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('loggedInUser'));
    } catch {
      return null;
    }
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const skillId = location.state?.skillId ?? null;
  const skillName = location.state?.skillName ?? '';

  // -----------------------------
  // Local State
  // -----------------------------
  const [showIntro, setShowIntro] = useState(true);     // Intro screen flag
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});           // { [question_id]: option_id }
  const [submitted, setSubmitted] = useState(false);
  const [rawScore, setRawScore] = useState(0);          // number of correct answers
  const [certificateUrl, setCertificateUrl] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);        // seconds per question
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Derived values
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex] || null;
  const progressPercent = totalQuestions > 0
    ? Math.round(((currentIndex + 1) / totalQuestions) * 100)
    : 0;

  // -----------------------------
  // Fetch questions (only after Start Exam)
  // -----------------------------
  const fetchQuestions = useCallback(async () => {
    if (!skillId) {
      setError('Invalid skill. Please go back and select a valid skill.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`http://localhost:5000/api/questions/${skillId}`);
      if (!res.ok) throw new Error(`Failed to fetch questions (status: ${res.status})`);
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Unable to load questions. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [skillId]);

  // -----------------------------
  // Start Exam (from Intro)
  // -----------------------------
  const handleStartExam = async () => {
    // Reset state
    setAnswers({});
    setSubmitted(false);
    setRawScore(0);
    setCertificateUrl('');
    setCurrentIndex(0);
    setTimeLeft(120);

    // Load questions then show the exam
    await fetchQuestions();
    setShowIntro(false);
  };

  // -----------------------------
  // Submit Exam
  // -----------------------------
  const handleSubmit = useCallback(async () => {
    if (totalQuestions === 0) return;

    // Calculate raw score (number correct)
    let calculatedCorrect = 0;
    questions.forEach((q) => {
      const selectedOptionId = answers[q.question_id];
      const selectedOption = q.options?.find((opt) => opt.option_id === selectedOptionId);
      if (selectedOption?.is_correct) calculatedCorrect += 1;
    });

    const scorePercent = Math.round((calculatedCorrect / totalQuestions) * 100);

    setRawScore(calculatedCorrect);
    setSubmitted(true);

    // Save result to backend
    try {
      const res = await fetch('http://localhost:5000/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: user?.EmployeeId,
          skill_id: skillId,
          answers,
          score: scorePercent,
          total: totalQuestions,
        }),
      });

      const data = await res.json();

      // Generate certificate if pass threshold (>= 80%)
      if (data?.success && scorePercent >= 80) {
        const certRes = await fetch('http://localhost:5000/api/certificate/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employee_id: user?.EmployeeId,
            skill_id: skillId,
            score: scorePercent,
          }),
        });

        const certData = await certRes.json();
        if (certData?.success && certData?.certificateUrl) {
          setCertificateUrl(certData.certificateUrl);
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  }, [answers, questions, skillId, totalQuestions, user]);

  // -----------------------------
  // Next Question
  // -----------------------------
  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(120);
    } else {
      handleSubmit();
    }
  }, [currentIndex, totalQuestions, handleSubmit]);

  // -----------------------------
  // Timer logic (runs only during active exam)
  // -----------------------------
  useEffect(() => {
    if (showIntro || submitted || totalQuestions === 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto move to next question when time runs out
          handleNext();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [showIntro, submitted, totalQuestions, handleNext]);

  // -----------------------------
  // Handlers
  // -----------------------------
  const handleOptionSelect = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const goBack = () => navigate(-1);

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="container-fluid px-0">
      {/* Hero Header */}
      <div
        className="py-4 mb-4 text-white"
        style={{
          background:
            'linear-gradient(135deg, rgba(13,110,253,1) 0%, rgba(32,201,151,1) 100%)',
        }}
      >
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-white bg-opacity-25 rounded-circle p-3">
                <i className="bi bi-mortarboard fs-3" aria-hidden="true"></i>
              </div>
              <div>
                <h2 className="fw-bold mb-0">Skill Exam</h2>
                <p className="mb-0">
                  <span className="fw-semibold">User:</span> {user?.firstname} {user?.lastname} &nbsp;|&nbsp;
                  <span className="fw-semibold">ID:</span> {user?.EmployeeId}
                </p>
              </div>
            </div>

            <div className="text-end">
              <button className="btn btn-outline-light me-2" onClick={goBack}>
                <i className="bi bi-x-circle me-1" aria-hidden="true"></i> Cancel
              </button>
              {!submitted && !showIntro && totalQuestions > 0 && (
                <button className="btn btn-light" onClick={handleSubmit}>
                  <i className="bi bi-check2-circle me-1" aria-hidden="true"></i> Submit Now
                </button>
              )}
            </div>
          </div>

          {/* Breadcrumbs */}
          <nav aria-label="breadcrumb" className="mt-3">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <span className="text-white-50">Home</span>
              </li>
              <li className="breadcrumb-item">
                <span className="text-white-50">Skills</span>
              </li>
              <li className="breadcrumb-item active text-white" aria-current="page">
                {skillName || '—'} (ID: {skillId || '—'})
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container">
        {/* Intro / Instructions */}
        {showIntro && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-info-circle me-2" aria-hidden="true"></i> Instructions
            </div>


<div className="card-body">
  <p className="text-muted mb-3">
    Please read these quick instructions before you begin.
  </p>

  <ul className="mb-3 ps-3">
    <li className="mb-3">
      <strong>Time:</strong> 2 minutes per question (auto next on timeout).
    </li>
    <li className="mb-3">
      <strong>Questions:</strong> Single-choice MCQs (choose one option).
    </li>
    <li className="mb-3">
      <strong>Scoring:</strong> Skipped questions count as incorrect.
    </li>
    <li className="mb-3">
      <strong>Pass &amp; Certificate:</strong> Score ≥ 80% to get a certificate.
    </li>
    <li className="mb-3">
      <strong>Exit:</strong> You can cancel anytime; progress saves on submit.
    </li>
  </ul>

  <div className="d-flex justify-content-between align-items-center">
    <div className="text-muted">
      Exam:&nbsp;
      <span className="fw-semibold">{skillName || '—'}</span>
      &nbsp;(ID:&nbsp;<span className="fw-semibold">{skillId || '—'}</span>)
    </div>

    <button
      className="btn btn-success"
      onClick={handleStartExam}
      disabled={!skillId}
      title={!skillId ? 'Invalid Skill ID' : undefined}
    >
      <i className="bi bi-play-circle me-1" aria-hidden="true"></i>
      Start Exam
    </button>
  </div>
</div>




          </div>
        )}

        {/* Stats Row (show only when exam started) */}
        {!showIntro && (
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card shadow-sm border-0">
                <div className="card-body d-flex align-items-center">
                  <div className="me-3 text-primary"><i className="bi bi-kanban fs-3" aria-hidden="true"></i></div>
                  <div>
                    <div className="text-muted small">Skill</div>
                    <div className="fw-semibold">{skillName || '—'}</div>
                  </div>
                  <span className="badge bg-primary-subtle text-primary ms-auto">{skillId || '—'}</span>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0">
                <div className="card-body d-flex align-items-center">
                  <div className="me-3 text-success"><i className="bi bi-list-ol fs-3" aria-hidden="true"></i></div>
                  <div>
                    <div className="text-muted small">Total Questions</div>
                    <div className="fw-semibold">{totalQuestions}</div>
                  </div>
                  <div className="ms-auto">
                    <div className="progress" style={{ width: 120, height: 8 }}>
                      <div className="progress-bar bg-success" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <div className="small text-muted text-end">{progressPercent}%</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0">
                <div className="card-body d-flex align-items-center">
                  <div className="me-3 text-danger"><i className="bi bi-stopwatch fs-3" aria-hidden="true"></i></div>
                  <div>
                    <div className="text-muted small">Time Left</div>
                    <div className="fw-semibold">
                      {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </div>
                  </div>
                  <span className="badge bg-danger-subtle text-danger ms-auto">2 min / question</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading / Error */}
        {!showIntro && loading && (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3">Loading questions...</p>
          </div>
        )}

        {!showIntro && error && !loading && (
          <div className="alert alert-danger">{error}</div>
        )}

        {/* Submitted View */}
        {!showIntro && !loading && submitted && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-info text-white">
              <i className="bi bi-clipboard-check me-2" aria-hidden="true"></i> Exam Result
            </div>
            <div className="card-body text-center">
              <h4 className="mb-3">
                Your Score: <span className="text-primary">{rawScore}</span> / {totalQuestions}
              </h4>
              <p className="mb-1">
                Skipped Questions:{' '}
                <span className="badge bg-secondary">
                  {Math.max(0, totalQuestions - Object.keys(answers).length)}
                </span>
              </p>

              <div className="d-flex justify-content-center gap-2 mt-3">
                <button className="btn btn-outline-secondary" onClick={goBack}>
                  <i className="bi bi-door-open me-1" aria-hidden="true"></i> Close Exam
                </button>

                {certificateUrl && (
                  <a
                    href={certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <i className="bi bi-award me-1" aria-hidden="true"></i> View Certificate
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active Exam View */}
        {!showIntro && !loading && !submitted && currentIndex < totalQuestions && currentQuestion && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="badge text-bg-secondary me-2">
                    Q {currentIndex + 1} / {totalQuestions}
                  </span>
                  <span className="badge text-bg-info">
                    Difficulty: {currentQuestion.difficulty}
                  </span>
                </div>
                <div className="text-danger fw-semibold">
                  <i className="bi bi-stopwatch me-1" aria-hidden="true"></i>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </div>
              </div>
            </div>

            <div className="card-body">
              <h5 className="fw-semibold">{currentQuestion.question_text}</h5>
              <hr />
              <div className="mt-2">
                {currentQuestion.options?.map((opt) => {
                  const name = `question-${currentQuestion.question_id}`;
                  const isChecked = answers[currentQuestion.question_id] === opt.option_id;

                  return (
                    <div className="form-check mb-2" key={opt.option_id}>
                      <input
                        className="form-check-input"
                        type="radio"
                        id={`${name}-${opt.option_id}`}
                        name={name}
                        value={opt.option_id}
                        checked={isChecked}
                        onChange={() => handleOptionSelect(currentQuestion.question_id, opt.option_id)}
                      />
                      <label className="form-check-label" htmlFor={`${name}-${opt.option_id}`}>
                        {opt.option_text}
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="d-flex align-items-center justify-content-between mt-4">
                <div className="w-100 me-2">
                  <div className="progress" style={{ height: 8 }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${progressPercent}%` }}
                      aria-valuenow={progressPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={!answers[currentQuestion.question_id] && currentIndex < totalQuestions - 1}
                  title={
                    !answers[currentQuestion.question_id] && currentIndex < totalQuestions - 1
                      ? 'Please select an option'
                      : undefined
                  }
                >
                  {currentIndex === totalQuestions - 1 ? (
                    <>
                      <i className="bi bi-send-check me-1" aria-hidden="true"></i> Submit Exam
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-right-circle me-1" aria-hidden="true"></i> Next Question
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-muted my-4">
          <small>
            <i className="bi bi-shield-check me-1" aria-hidden="true"></i>
            Exam module · Built with React &amp; Bootstrap
          </small>
        </div>
      </div>
    </div>
  );
}
