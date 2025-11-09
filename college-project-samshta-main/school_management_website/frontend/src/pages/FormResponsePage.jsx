// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';

// export default function FormResponsePage() {
//   const { formId } = useParams();
//   const [form, setForm] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [answers, setAnswers] = useState({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchForm() {
//       try {
//         // Fetch form details if needed (not just questions)
//         const qRes = await axios.get(`http://localhost:5000/api/forms/${formId}/questions`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
//         });
//         setQuestions(qRes.data);
//       } catch(e) {
//         setQuestions([]);
//       }
//       setLoading(false);
//     }
//     fetchForm();
//   }, [formId]);

//   const handleChange = (qid, value) => {
//     setAnswers(a => ({ ...a, [qid]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post(
//         `http://localhost:5000/api/forms/${formId}/submit`,
//         { answers: questions.map(q => ({
//           question_id: q.id, answer: answers[q.id] || ""
//         })) },
//         { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
//       );
//       alert("Form submitted!");
//     } catch {
//       alert("Failed to submit form");
//     }
//   };

//   if (loading) return <div>Loading...</div>;
//   return (
//     <div className="container mt-3">
//       <h3>Fill Form</h3>
//       <form onSubmit={handleSubmit}>
//         {questions.map(q => (
//           <div key={q.id} className="mb-3">
//             <label className="form-label">{q.question_text}</label>
//             {q.question_type === "text" && (
//               <input className="form-control" type="text" value={answers[q.id] || ""} onChange={(e) => handleChange(q.id, e.target.value)} />
//             )}
//             {q.question_type === "number" && (
//               <input className="form-control" type="number" value={answers[q.id] || ""} onChange={(e) => handleChange(q.id, e.target.value)} />
//             )}
//             {q.question_type === "date" && (
//               <input className="form-control" type="date" value={answers[q.id] || ""} onChange={(e) => handleChange(q.id, e.target.value)} />
//             )}
//             {q.question_type === "select" && (
//               <select className="form-select" value={answers[q.id] || ""} onChange={(e) => handleChange(q.id, e.target.value)}>
//                 <option value="">Select...</option>
//                 {(q.options ? q.options.split(",") : []).map(opt =>
//                   <option key={opt} value={opt}>{opt}</option>
//                 )}
//               </select>
//             )}
//           </div>
//         ))}
//         <button type="submit" className="btn btn-primary">Submit</button>
//       </form>
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function FormResponsePage() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch form details (for deadline, title, etc)
  useEffect(() => {
    async function fetchFormAndQuestions() {
      setLoading(true);
      setError('');
      try {
        // Get form details (with deadline)
        const formRes = await axios.get(`http://localhost:5000/api/forms/${formId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setForm(formRes.data);

        // Get questions
        const qRes = await axios.get(`http://localhost:5000/api/forms/${formId}/questions`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setQuestions(qRes.data);
      } catch (e) {
        setError('Failed to load form');
      }
      setLoading(false);
    }
    fetchFormAndQuestions();
  }, [formId]);

  const handleChange = (qid, value) => {
    setAnswers(a => ({ ...a, [qid]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:5000/api/forms/${formId}/submit`,
        { answers: questions.map(q => ({
          question_id: q.id, answer: answers[q.id] || ""
        })) },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Form submitted!");
    } catch {
      alert("Failed to submit form");
    }
  };

  // Deadline check helper
  const isExpired = (form) =>
    form && form.deadline && (new Date() > new Date(form.deadline));

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="container mt-3">
      <h3>{form ? form.title : 'Fill Form'}</h3>
      {form && isExpired(form) ? (
        <div style={{ color: 'red', fontWeight: 600, fontSize: '1.2em', margin: '24px 0' }}>
          This form's deadline has passed. You cannot fill this form.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {questions.map(q => (
            <div key={q.id} className="mb-3">
              <label className="form-label">{q.question_text}</label>
              {q.question_type === "text" && (
                <input className="form-control" type="text" value={answers[q.id] || ""} onChange={(e) => handleChange(q.id, e.target.value)} />
              )}
              {q.question_type === "number" && (
                <input className="form-control" type="number" value={answers[q.id] || ""} onChange={(e) => handleChange(q.id, e.target.value)} />
              )}
              {q.question_type === "date" && (
                <input className="form-control" type="date" value={answers[q.id] || ""} onChange={(e) => handleChange(q.id, e.target.value)} />
              )}
              {q.question_type === "select" && (
                <select className="form-select" value={answers[q.id] || ""} onChange={(e) => handleChange(q.id, e.target.value)}>
                  <option value="">Select...</option>
                  {(q.options ? q.options.split(",") : []).map(opt =>
                    <option key={opt} value={opt}>{opt}</option>
                  )}
                </select>
              )}
            </div>
          ))}
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>
      )}
    </div>
  );
}
