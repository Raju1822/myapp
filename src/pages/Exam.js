
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'

export default function Exam() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const location = useLocation();
  const skillId = location.state?.skillId || null;
  const skillName = location.state?.skillName || '';

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);





  useEffect(() => {

    if (skillId) {
      fetch(`http://localhost:5000/api/questions/${skillId}`)
        .then(res => res.json())
        .then(data => {
          // console.log('Fetched data:', data);
          setQuestions(data);
        })
        .catch(err => console.error('Fetch error:', err));
    }
  }, [skillId]);







  const handleOptionSelect = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  // const handleSubmit = () => {
  //   let calculatedScore = 0;
  //   questions.forEach(q => {
  //     const selectedOptionId = answers[q.question_id];
  //     const selectedOption = q.options.find(opt => opt.option_id === selectedOptionId);
  //     if (selectedOption && selectedOption.is_correct) {
  //       calculatedScore++;
  //     }
  //   });
  //   setScore(calculatedScore);
  //   setSubmitted(true);
  // };

  const [certificateUrl, setCertificateUrl] = useState('');
  const handleSubmit = () => {
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



    // ✅ Save result to backend
    fetch('http://localhost:5000/api/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_id: user?.EmployeeId, // Replace with logged-in user ID
        skill_id: skillId,
        answers: answers,
        score: scorePercent,
        total: totalQuestions
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log('Response:', data);
        if (data.success) {
          alert(`Exam saved! Attempt ID: ${data.attemptId}`);
          if (scorePercent >= 80) {
            // alert('Congratulations! You are eligible for a certificate.');




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
              .then(data => {
                if (data.success) {
                  setCertificateUrl(data.certificateUrl);
                  alert('Certificate generated successfully!');
                }
              });





          }
        } else {
          alert('Failed to save exam result.');
        }
      })
      .catch(err => console.error('Error:', err));
  };




  //BAck to dashboard
  const navigate = useNavigate();
  const goback = () => {
    navigate('/member-dashboard');
  };




  return (


    <div className="container mt-4">


      <div class="row d-flex justify-content-between">
        <div class="col-auto">
          <h3> User : {user?.firstname} {user?.lastname} ID : {user?.EmployeeId}</h3>
          <h4>Exam for {skillName} (Skill ID: {skillId})</h4>
        </div>
        <div class="col-auto">
          <button className="btn btn-warning btn-sm ms-2" onClick={() => goback()}>Cancel Exam</button>
        </div>
      </div>







      <hr></hr>


      {questions.length === 0 ? (
        <p>Loading questions...</p>
      ) : (
        <form>
          {questions.map((q, index) => (
            <div key={q.question_id} className="mb-4">
              <h5>{index + 1}. {q.question_text} <span className="badge bg-secondary">{q.difficulty}</span></h5>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {q.options.map(opt => (
                  <li key={opt.option_id}>
                    <label>
                      <input
                        type="radio"
                        name={`question-${q.question_id}`}
                        value={opt.option_id}
                        checked={answers[q.question_id] === opt.option_id}
                        onChange={() => handleOptionSelect(q.question_id, opt.option_id)}
                      />{' '}
                      {opt.option_text}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}


          {submitted ? (
            <div className="alert alert-info mt-3">
              <h4>Your Score: {score} / {questions.length}</h4>
              <button
                className="btn btn-secondary mt-3"
                onClick={() => navigate('/member-dashboard')} // or use navigate('/dashboard')
              >
                Close Exam
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-success" onClick={handleSubmit}>
              Submit Exam
            </button>
          )}



          {certificateUrl && (
            <a href={certificateUrl} target="" className="btn btn-primary mt-3">
              Download Certificate
            </a>
          )}


        </form>
      )}
    </div>

    
  );
}
