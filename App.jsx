import React, { useState } from 'react';
import { Upload, Briefcase, Sparkles, Target, CheckCircle2, AlertTriangle, BrainCircuit } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function Score({ label, value }) {
  return <div className="score-card"><div className="score-ring"><span>{value ?? '--'}</span></div><p>{label}</p></div>;
}

function ListCard({ title, icon, items = [] }) {
  return <section className="card"><h3>{icon}{title}</h3><ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul></section>;
}

export default function App() {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAnalyze(e) {
    e.preventDefault();
    setError(''); setResult(null);
    if (!resume) return setError('Upload your resume PDF first.');
    if (jobDescription.trim().length < 80) return setError('Paste a proper job description.');
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('jobDescription', jobDescription);
    try {
      const res = await fetch(`${API_URL}/api/analyze`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Analysis failed');
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return <main className="app">
    <header className="hero">
      <div><p className="eyebrow">India-focused AI job matcher</p><h1>Fix your resume for the job you want.</h1><p>Upload a PDF resume, paste a job description, and get ATS score, match score, missing skills, interview questions, and a 7-day improvement plan.</p></div>
      <div className="hero-badge"><Sparkles size={28}/><span>Built for freshers & 0-2 yrs</span></div>
    </header>

    <div className="layout">
      <form className="panel" onSubmit={handleAnalyze}>
        <h2><Upload/> Resume + Job</h2>
        <label className="upload-box">
          <input type="file" accept="application/pdf" onChange={e => setResume(e.target.files?.[0])}/>
          <strong>{resume ? resume.name : 'Upload PDF resume'}</strong>
          <span>Only PDF supported</span>
        </label>
        <label className="field-label">Job Description</label>
        <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste job description from LinkedIn, Naukri, Internshala, etc." />
        {error && <p className="error">{error}</p>}
        <button disabled={loading}>{loading ? 'Analyzing...' : 'Analyze Resume'}</button>
      </form>

      <section className="dashboard">
        {!result ? <div className="empty"><BrainCircuit size={54}/><h2>Your analysis will appear here</h2><p>Tip: Use a real job description for best results.</p></div> : <>
          <div className="top-row"><Score label="Job Match" value={result.jobMatchScore}/><Score label="ATS Score" value={result.atsScore}/><div className="verdict"><p>Target role</p><h2>{result.targetRole}</h2><span>{result.verdict}</span></div></div>
          <div className="grid">
            <ListCard title="Strengths" icon={<CheckCircle2/>} items={result.strengths}/>
            <ListCard title="Weaknesses" icon={<AlertTriangle/>} items={result.weaknesses}/>
            <ListCard title="Missing Skills" icon={<Target/>} items={result.missingSkills}/>
            <ListCard title="Resume Fixes" icon={<Briefcase/>} items={result.resumeFixes}/>
            <ListCard title="Interview Questions" icon={<BrainCircuit/>} items={result.interviewQuestions}/>
            <ListCard title="7-Day Plan" icon={<Sparkles/>} items={result.sevenDayPlan}/>
          </div>
          <section className="card wide"><h3>ATS-Friendly Summary</h3><p>{result.rewrittenSummary}</p><h3>Improved Bullets</h3><ul>{result.improvedBullets.map((x,i)=><li key={i}>{x}</li>)}</ul></section>
        </>}
      </section>
    </div>
  </main>;
}
