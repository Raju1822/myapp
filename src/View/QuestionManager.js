import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
export default function QuestionManager() {
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
    fetch('http://localhost:5000/api/skills')
      .then(res => res.json())
      .then(data => setSkills(data));
  }, []);
  useEffect(() => {
    if (selectedSkill) {
      fetch(`http://localhost:5000/api/questions/${selectedSkill}`)
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
    fetch('http://localhost:5000/api/questions', {
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
    fetch(`http://localhost:5000/api/questions/${selectedSkill}`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setFilteredQuestions(data);
      });
  };
  const handleDeleteQuestion = (id) => {
    fetch(`http://localhost:5000/api/questions/${id}`, { method: 'DELETE' })
      .then(() => {
        alert('Question deleted!');
        setQuestions(questions.filter(q => q.question_id !== id));
      });
  };
  const startEditQuestion = (q) => {
    setEditingQuestion({ ...q });
  };
  const handleUpdateQuestion = () => {
    fetch(`http://localhost:5000/api/questions/${editingQuestion.question_id}`, {
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
    fetch(`http://localhost:5000/api/options/${optionId}`, {
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
    navigate('/dashboard');
  };
  return (
    <div className="container mt-4">
      <div class="row d-flex justify-content-between">
        <div class="col-auto">
          <h3 className="">Manage Questions</h3>
        </div>
        <div class="col-auto">
          <button className="btn btn-warning btn-sm ms-2" onClick={() => goback()}>Close Question Manager</button>
        </div>
      </div>
      <select className="form-select mb-3" onChange={(e) => setSelectedSkill(e.target.value)}>
        <option value="">Select Skill</option>
        {skills.map(skill => (
          <option key={skill.skill_id} value={skill.skill_id}>{skill.skill_name}</option>
        ))}
      </select>
          <h5 className="card p-1 mt-4 text-center bg-info" >Add New Question</h5>
          <input className="form-control mb-2" placeholder="Question text" value={newQuestion.text} onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))} />
          <select className="form-select mb-2" value={newQuestion.difficulty} onChange={(e) => setNewQuestion(prev => ({ ...prev, difficulty: e.target.value }))}>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          {newQuestion.options.map((opt, index) => (
            <div key={index} className="d-flex mb-2">
              <input className="form-control me-2" placeholder="Option text" value={opt.text} onChange={(e) => handleOptionChange(index, 'text', e.target.value)} />
              <input type="checkbox" checked={opt.is_correct} onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)} /> Correct
            </div>
          ))}
          <div class="row d-flex justify-content-between">
            <div class="col-auto">
              <button className="btn btn-secondary mb-2" onClick={addOptionField}>Add Option</button>
            </div>
            <div class="col-auto">
              <button className="btn btn-success" onClick={handleAddQuestion}>Save Question</button>
            </div>
          </div>
<hr className="m-5"></hr>
      {selectedSkill && (
        <>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <h4>Questions for {skills.find(s => s.skill_id === selectedSkill)?.skill_name}</h4>
          {currentQuestions.map(q => (
            <div key={q.question_id} className="border p-2 mb-2">
              {editingQuestion && editingQuestion.question_id === q.question_id ? (
                <>
                  <input className="form-control mb-2" value={editingQuestion.question_text} onChange={(e) => setEditingQuestion(prev => ({ ...prev, question_text: e.target.value }))} />
                  <select className="form-select mb-2" value={editingQuestion.difficulty} onChange={(e) => setEditingQuestion(prev => ({ ...prev, difficulty: e.target.value }))}>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                  <button className="btn btn-primary btn-sm" onClick={handleUpdateQuestion}>Save</button>
                  <button className="btn btn-secondary btn-sm ms-2" onClick={() => setEditingQuestion(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <strong>{q.question_text}</strong> ({q.difficulty})
                  <button className="btn btn-warning btn-sm ms-2" onClick={() => startEditQuestion(q)}>Edit</button>
                  <button className="btn btn-danger btn-sm ms-2" onClick={() => handleDeleteQuestion(q.question_id)}>Delete</button>
                </>
              )}
              <ul>
                {q.options.map(opt => (
                  <li key={opt.option_id}>
                    <input
                      className="form-control d-inline-block w-50"
                      value={opt.option_text}
                      onChange={(e) => handleOptionUpdate(opt.option_id, e.target.value, opt.is_correct)}
                    />
                    <input
                      type="checkbox"
                      checked={opt.is_correct}
                      onChange={(e) => handleOptionUpdate(opt.option_id, opt.option_text, e.target.checked)}
                    /> Correct
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {/* Pagination */}
          <nav>
            <ul className="pagination">
              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => paginate(i + 1)}>{i + 1}</button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
