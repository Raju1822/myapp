import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
export default function Exam() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const location = useLocation();
  const skillId = location.state?.skillId || null;
  const skillName = location.state?.skillName || '';
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [certificateUrl, setCertificateUrl] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question
  const navigate = useNavigate();
  // Fetch questions
  useEffect(() => {
    if (skillId) {
      fetch(`http://localhost:5000/api/questions/${skillId}`)
        .then(res => res.json())
        .then(data => setQuestions(data))
        .catch(err => console.error('Fetch error:', err));
    }
  }, [skillId]);
  // Submit Exam
  const handleSubmit = useCallback(() => {
    let calculatedScore = 0;
    questions.forEach(q => {
      const selectedOptionId = answers[q.question_id];
      const selectedOption = q.options.find(opt => opt.option_id === selectedOptionId);
      if (selectedOption && selectedOption.is_correct) {
        calculatedScore++;
      }
    });
    const totalQuestions = questions.length;
    const scorePercent = Math.round((calculatedScore / totalQuestions) * 100);
    setScore(calculatedScore);
    setSubmitted(true);
    // Save result to backend
    fetch('http://localhost:5000/api/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_id: user?.EmployeeId,
        skill_id: skillId,
        answers: answers,
        score: scorePercent,
        total: totalQuestions
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && scorePercent >= 80) {
          fetch('http://localhost:5000/api/certificate/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employee_id: user?.EmployeeId,
              skill_id: skillId,
              score: scorePercent
            })
          })
            .then(res => res.json())
            .then(certData => {
              if (certData.success) setCertificateUrl(certData.certificateUrl);
            });
        }
      })
      .catch(err => console.error('Error:', err));
  }, [answers, questions, skillId, user]);
  // Next Question
  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(120);
    } else {
      handleSubmit();
    }
  }, [currentIndex, questions.length, handleSubmit]);
  // Timer logic
  useEffect(() => {
    if (questions.length === 0 || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 1) {
          handleNext(); // Auto move to next question
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleNext, submitted, questions.length]);
  const handleOptionSelect = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };
  const goback = () => navigate('/member-dashboard');
  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row align-items-center mb-3">
        <div className="col-md-8">
          <h3 className="fw-bold text-primary">
            User: {user?.firstname} {user?.lastname} | ID: {user?.EmployeeId}
          </h3>
          <h5 className="text-muted">
            Exam for <span className="text-success">{skillName}</span> (Skill ID: {skillId})
          </h5>
        </div>
        <div className="col-md-4 text-end">
          <button className="btn btn-outline-danger btn-sm" onClick={goback}>
            Cancel Exam
          </button>
        </div>
      </div>
      <hr />
      {/* Main Content */}
      {questions.length === 0 ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Loading questions...</p>
        </div>
      ) : submitted ? (
        <div className="alert alert-info text-center">
          <h4>Your Score: {score} / {questions.length}</h4>
          <p>Skipped Questions: {questions.length - Object.keys(answers).length}</p>
          <button className="btn btn-secondary mt-3" onClick={goback}>Close Exam</button>
          {certificateUrl && (
            <a href={certificateUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-3">
              Download Certificate
            </a>
          )}
        </div>
      ) : currentIndex < questions.length ? (
        <div className="bg-light p-4 rounded shadow-sm">
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="d-flex justify-content-between">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span className="text-danger fw-bold">
                Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="progress m-4">
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          {/* Question */}
          <h5>
            {questions[currentIndex].question_text}{' '}
            <span className="badge bg-secondary">{questions[currentIndex].difficulty}</span>
          </h5>
          <div className="mt-2">
            {questions[currentIndex].options.map(opt => (
              <div className="form-check" key={opt.option_id}>
                <input
                  className="form-check-input"
                  type="radio"
                  name={`question-${questions[currentIndex].question_id}`}
                  value={opt.option_id}
                  checked={answers[questions[currentIndex].question_id] === opt.option_id}
                  onChange={() => handleOptionSelect(questions[currentIndex].question_id, opt.option_id)}
                />
                <label className="form-check-label">{opt.option_text}</label>
              </div>
            ))}
          </div>
          {/* Next Button */}
          <button className="btn btn-primary w-100 mt-3" onClick={handleNext}>
            {currentIndex === questions.length - 1 ? 'Submit Exam' : 'Next Question'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
