import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useParams } from 'react-router-dom';
import ChatWidget from '../components/ChatWidget';

export default function FormResponsePage() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchFormAndQuestions() {
      setLoading(true);
      setError('');
      try {
        // Get form details (with deadline)
        const formRes = await axiosInstance.get(`/forms/${formId}`);
        setForm(formRes.data);

        // Get questions
        const qRes = await axiosInstance.get(`/forms/${formId}/questions`);
        setQuestions(qRes.data);
      } catch (e) {
        console.error('Error loading form:', e);
        setError(e.response?.data?.error || 'Failed to load form');
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
    setSubmitting(true);
    setError('');

    try {
      await axiosInstance.post(`/forms/${formId}/submit`, {
        answers: questions.map(q => ({
          question_id: q.id,
          answer: answers[q.id] || ""
        }))
      });
      alert("Form submitted successfully!");
      window.location.reload();
    } catch (err) {
      console.error('Error submitting form:', err);
      const errorMsg = err.response?.data?.error || "Failed to submit form";
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Deadline check helper
  const isExpired = (form) => form && form.deadline && (new Date() > new Date(form.deadline));

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading form...</p>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mt-3">
      <h3>{form ? form.title : 'Fill Form'}</h3>
      {form && form.description && (
        <p className="text-muted">{form.description}</p>
      )}

      {form && form.deadline && (
        <div className="alert alert-info">
          <i className="bi bi-calendar-event me-2"></i>
          <strong>Deadline:</strong> {new Date(form.deadline).toLocaleString()}
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {form && isExpired(form) ? (
        <div className="alert alert-danger" style={{ fontSize: '1.1em' }}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>This form's deadline has passed.</strong> You cannot submit this form anymore.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {questions.map((q, index) => (
            <div key={q.id} className="mb-3 card p-3">
              <label className="form-label fw-bold">
                {index + 1}. {q.question_text}
              </label>

              {q.question_type === "text" && (
                <input
                  className="form-control"
                  type="text"
                  value={answers[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  disabled={submitting}
                  required
                />
              )}

              {q.question_type === "number" && (
                <input
                  className="form-control"
                  type="number"
                  value={answers[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  disabled={submitting}
                  required
                />
              )}

              {q.question_type === "date" && (
                <input
                  className="form-control"
                  type="date"
                  value={answers[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  disabled={submitting}
                  required
                />
              )}

              {q.question_type === "select" && (
                <select
                  className="form-select"
                  value={answers[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  disabled={submitting}
                  required
                >
                  <option value="">-Select an option --</option>
                  {(q.options ? q.options.split(",") : []).map(opt =>
                    <option key={opt.trim()} value={opt.trim()}>
                      {opt.trim()}
                    </option>
                  )}
                </select>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="btn btn-primary btn-lg mt-3"
            disabled={submitting || questions.length === 0}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Submitting...
              </>
            ) : (
              'Submit Form'
            )}
          </button>
        </form>
      )}

      <ChatWidget />
    </div>
  );
}
