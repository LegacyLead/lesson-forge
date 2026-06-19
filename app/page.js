'use client';

import { useState } from 'react';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false); // State hook to track theme mode
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [week, setWeek] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  
  const [syllabusFiles, setSyllabusFiles] = useState([]);
  const [templateFiles, setTemplateFiles] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [resultHtml, setResultHtml] = useState('');

  const handleMultiFileChange = (e, setFilesState) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const targetFiles = files.slice(0, 5);
    const loadedImages = [];

    targetFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        loadedImages.push({
          base64: reader.result.split(',')[1],
          mimeType: file.type,
          preview: reader.result
        });

        if (loadedImages.length === targetFiles.length) {
          setFilesState(loadedImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const generateLessonNote = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultHtml('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className,
          subject,
          topic,
          week,
          customInstructions,
          syllabusImages: syllabusFiles,
          templateImages: templateFiles
        })
      });

      const data = await response.json();
      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        setResultHtml(data.html);
      }
    } catch (err) {
      alert(`Connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById('note-canvas');
    if (!element) return;

    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <html>
        <head>
          <title>${subject || 'Lesson'}_Note_Week_${week || 'X'}</title>
          <style>
            @page { size: A4; margin: 20mm 20mm; }
            body {
              font-family: Georgia, 'Times New Roman', serif;
              color: #1A1A2E;
              background-color: #ffffff;
              line-height: 1.6;
              font-size: 14px;
              margin: 0; padding: 0;
            }
            h1, h2, h3 { font-family: Georgia, serif; color: #0F172A; page-break-after: avoid; }
            h1 { font-size: 20px; border-bottom: 2px solid #059669; padding-bottom: 6px; margin-bottom: 16px; }
            h2 { font-size: 16px; color: #064E3B; margin-top: 24px; }
            h3 { font-size: 14px; color: #065F46; margin-top: 18px; }
            p, li { font-size: 14px; color: #374151; }
            ul, ol { padding-left: 24px; margin-bottom: 12px; }
            li { margin-bottom: 6px; }
            p, tr, li, h2, h3, table { page-break-inside: avoid; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th { background: #F0FDF4; color: #065F46; font-weight: 600; padding: 10px; border: 1px solid #D1FAE5; text-align: left; }
            td { padding: 10px; border: 1px solid #E5E7EB; color: #374151; }
            tr:nth-child(even) td { background: #F9FAFB; }
            hr { border: none; border-top: 1.5px solid #E5E7EB; margin: 24px 0; }
          </style>
        </head>
        <body>
          ${element.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 100);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const downloadWord = () => {
    const element = document.getElementById('note-canvas');
    if (!element) return;

    const fileName = `${subject || 'Lesson'}_Note_Week_${week || 'X'}.doc`;

    const htmlString = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <title>Lesson Note</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; }
            h1 { font-size: 18pt; color: #0F172A; border-bottom: 2px solid #059669; }
            h2 { font-size: 14pt; color: #064E3B; }
            p, li { font-size: 11pt; color: #374151; }
            table { width: 100%; border-collapse: collapse; }
            th { background-color: #F0FDF4; border: 1px solid #D1FAE5; padding: 6px; text-align: left; }
            td { border: 1px solid #E5E7EB; padding: 6px; }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlString], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\s+/g, '_');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyText = () => {
    const element = document.getElementById('note-canvas');
    if (!element) return;
    navigator.clipboard.writeText(element.innerText);
    alert('Lesson text copied to clipboard!');
  };

  return (
    <div className={isDarkMode ? 'dark-theme' : 'light-theme'}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        /* ── CENTRAL THEME VARIABLES ── */
        .light-theme {
          --bg-main: #F8FAFC;
          --bg-panel: #FFFFFF;
          --bg-input: #F8FAFC;
          --bg-header: rgba(255, 255, 255, 0.9);
          --bg-output: #F1F5F9;
          --border-color: #E2E8F0;
          --border-input: #CBD5E1;
          --text-main: #334155;
          --text-heading: #1E293B;
          --text-muted: #64748B;
          --text-label: #475569;
          --badge-bg: #E6F4EA;
          --badge-border: #A3E635;
          --badge-text: #059669;
        }

        .dark-theme {
          --bg-main: #070C18;
          --bg-panel: linear-gradient(160deg, rgba(17,24,39,0.9) 0%, rgba(10,15,30,0.95) 100%);
          --bg-input: rgba(255,255,255,0.04);
          --bg-header: rgba(7, 12, 24, 0.85);
          --bg-output: #0D1321;
          --border-color: rgba(255,255,255,0.07);
          --border-input: rgba(255,255,255,0.08);
          --text-main: #E2E8F0;
          --text-heading: #F1F5F9;
          --text-muted: #64748B;
          --text-label: #475569;
          --badge-bg: rgba(16,185,129,0.08);
          --badge-border: rgba(16,185,129,0.2);
          --badge-text: #10B981;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', system-ui, sans-serif;
          background: var(--bg-main);
          color: var(--text-main);
          min-height: 100dvh;
          transition: background 0.3s, color 0.3s;
        }

        .app-shell {
          display: flex;
          flex-direction: column;
          min-height: 100dvh;
          background: var(--bg-main);
        }

        /* ── Header configuration ── */
        .header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: var(--bg-header);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-color);
          padding: 0 1.5rem;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background 0.3s, border-color 0.3s;
        }

        .header-left { display: flex; align-items: center; gap: 0.75rem; }
        .header-right { display: flex; align-items: center; gap: 1rem; }

        .brand-mark {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
          color: #fff;
          letter-spacing: -0.5px;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
          flex-shrink: 0;
        }

        .brand-name {
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: -0.4px;
          color: var(--text-heading);
        }

        .header-badge {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.3px;
          color: var(--badge-text);
          background: var(--badge-bg);
          border: 1px solid var(--badge-border);
          padding: 4px 10px;
          border-radius: 100px;
        }

        /* ── Modern Theme Toggle Switch Button ── */
        .theme-toggle-btn {
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-heading);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .theme-toggle-btn:hover {
          border-color: #10B981;
          background: rgba(16, 185, 129, 0.05);
        }

        /* ── Layout Grid ── */
        .main-grid {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
          padding: 1.25rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        @media (min-width: 1024px) {
          .main-grid {
            grid-template-columns: 5fr 7fr;
            padding: 1.5rem;
            gap: 1.5rem;
          }
        }

        .panel {
          background: var(--bg-panel);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
          transition: background 0.3s, border-color 0.3s;
        }

        .form-panel { display: flex; flex-direction: column; }
        .form-header { padding: 1.5rem 1.5rem 0; }
        .form-title { font-size: 1.1rem; font-weight: 700; color: var(--text-heading); letter-spacing: -0.3px; }
        .form-subtitle { font-size: 12px; color: var(--text-muted); margin-top: 4px; line-height: 1.5; }
        .form-body { padding: 1.25rem 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 1.15rem; flex: 1; }

        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .field-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-label); margin-bottom: 6px; }
        .field-label-note { font-size: 10px; font-weight: 400; color: var(--text-muted); text-transform: none; letter-spacing: 0; }
        
        .field-input, .field-textarea {
          width: 100%;
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: var(--text-heading);
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, color 0.2s;
        }
        .field-textarea { min-height: 76px; resize: none; font-size: 13px; }
        .field-input::placeholder, .field-textarea::placeholder { color: #94A3B8; }
        .field-input:focus, .field-textarea:focus {
          border-color: #10B981;
          background: var(--bg-panel);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .section-label { display: flex; align-items: center; gap: 0.5rem; margin: 0.25rem 0; }
        .section-label-line { flex: 1; height: 1px; background: var(--border-color); }
        .section-label-text { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #94A3B8; white-space: nowrap; }

        /* ── Image Upload Elements ── */
        .capture-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .capture-slot-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-label); margin-bottom: 6px; }
        .capture-slot { position: relative; border: 1.5px dashed var(--border-input); border-radius: 12px; background: var(--bg-input); overflow: hidden; transition: border-color 0.2s, background 0.2s; cursor: pointer; }
        .capture-slot:hover { border-color: #10B981; background: rgba(16, 185, 129, 0.04); }
        .capture-slot input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; z-index: 2; width: 100%; height: 100%; }
        .capture-slot-inner { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.25rem 0.75rem; gap: 0.35rem; pointer-events: none; }
        .capture-icon { width: 36px; height: 36px; border-radius: 8px; background: var(--border-input); display: flex; align-items: center; justify-content: center; font-size: 16px; opacity: 0.8; }
        .capture-label-text { font-size: 12px; font-weight: 600; color: var(--text-main); text-align: center; }
        .capture-hint { font-size: 10px; color: var(--text-muted); text-align: center; }

        .capture-slot.linked { border-color: #10B981; background: rgba(16, 185, 129, 0.05); }
        .capture-slot.linked-template { border-color: #0EA5E9; background: rgba(14, 165, 233, 0.05); }

        .preview-grid-wrap { margin-top: 8px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; background: var(--bg-input); padding: 6px; border-radius: 10px; border: 1px solid var(--border-color); }
        .preview-grid-thumb { width: 100%; height: 42px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-input); }
        .preview-count-label { grid-column: span 5; font-size: 9px; font-weight: 700; padding: 0 2px 2px; letter-spacing: 0.3px; text-transform: uppercase; }
        .badge-syllabus { color: #059669; }
        .badge-template { color: #0284C7; }

        /* ── Actions buttons ── */
        .forge-btn {
          width: 100%;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 14px;
          border: none;
          border-radius: 10px;
          padding: 14px 20px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
          transition: transform 0.1s, box-shadow 0.2s;
        }
        .forge-btn:hover:not(:disabled) { transform: translateY(-0.5px); box-shadow: 0 6px 20px rgba(5, 150, 105, 0.35); }
        .forge-btn:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
        .forge-btn-shimmer { position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%); transform: translateX(-100%); animation: shimmer 2.2s infinite; }

        @keyframes shimmer { to { transform: translateX(200%); } }
        .spinner-inline { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.75s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Output Configurations ── */
        .output-panel { display: flex; flex-direction: column; min-height: 520px; }
        .output-header { display: flex; flex-direction: column; gap: 0.625rem; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); background: var(--bg-input); transition: background 0.3s; }
        @media (min-width: 640px) { .output-header { flex-direction: row; align-items: center; justify-content: space-between; } }

        .output-header-left { display: flex; align-items: center; gap: 0.5rem; }
        .output-dot { width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 6px rgba(16,185,129,0.4); }
        .output-dot-idle { background: #CBD5E1; box-shadow: none; }
        .output-label { font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-label); }

        .export-actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .export-btn { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; border-radius: 8px; padding: 6px 12px; cursor: pointer; border: 1px solid var(--border-input); display: flex; align-items: center; gap: 6px; background: var(--bg-panel); color: var(--text-heading); transition: background 0.15s, border-color 0.15s; }
        .export-btn:hover { background: var(--bg-main); border-color: #CBD5E1; }
        .export-btn-word { color: #1D4ED8; }
        .export-btn-pdf { color: #047857; }

        .output-body { flex: 1; overflow-y: auto; padding: 1.5rem; background: var(--bg-output); display: flex; align-items: flex-start; justify-content: center; transition: background 0.3s; }

        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; padding: 4rem 2rem; text-align: center; width: 100%; }
        .empty-icon { width: 56px; height: 56px; border: 1.5px dashed var(--border-input); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #94A3B8; }
        .empty-text { font-size: 13px; font-weight: 500; color: var(--text-muted); line-height: 1.5; max-width: 260px; }

        .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; width: 100%; padding: 4rem 2rem; }
        .loading-ring { width: 36px; height: 36px; border: 3px solid var(--border-color); border-top-color: #10B981; border-radius: 50%; animation: spin 0.9s linear infinite; }
        .loading-text { font-size: 13px; font-weight: 500; color: var(--text-muted); }
        .loading-bars { display: flex; flex-direction: column; gap: 6px; width: 160px; margin-top: 0.25rem; }
        .loading-bar { height: 6px; border-radius: 100px; background: var(--border-color); overflow: hidden; position: relative; }
        .loading-bar::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(16,185,129,0.2), transparent); transform: translateX(-100%); animation: shimmer 1.6s ease-in-out infinite; }
        .loading-bar:nth-child(2) { width: 70%; }
        .loading-bar:nth-child(3) { width: 85%; }

        /* ── Document Paper Page Note Sheet ── */
        .doc-canvas {
          background: #FFFFFF;
          color: #1E293B;
          border-radius: 12px;
          width: 100%;
          max-width: 680px;
          min-height: 620px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          font-family: Georgia, 'Times New Roman', serif;
          position: relative;
        }
        .doc-canvas::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px); background-size: 24px 24px; pointer-events: none; }
        
        .doc-canvas-edit-hint { background: #F0FDF4; border-bottom: 1px dashed #A7F3D0; color: #15803D; font-size: 10px; font-weight: 600; text-align: center; padding: 5px 10px; font-family: 'Inter', sans-serif; letter-spacing: 0.3px; text-transform: uppercase; }
        .doc-canvas-stripe { height: 5px; background: linear-gradient(90deg, #10B981 0%, #0284C7 100%); }
        .doc-canvas-content { padding: 2.5rem 2.75rem; position: relative; z-index: 1; outline: none; min-height: 560px; text-align: left; }

        .doc-canvas-content h1 { font-size: 1.3rem; border-bottom: 2px solid #059669; padding-bottom: 0.5rem; margin-bottom: 1.25rem; font-family: Georgia, serif; color: #0F172A; font-weight: 700; }
        .doc-canvas-content h2 { font-size: 1.1rem; margin-top: 1.5rem; color: #064E3B; font-family: Georgia, serif; font-weight: 700; }
        .doc-canvas-content h3 { font-size: 0.98rem; margin-top: 1.25rem; color: #065F46; font-family: Georgia, serif; font-weight: 700; }
        .doc-canvas-content p { font-size: 0.9rem; line-height: 1.75; color: #334155; margin-bottom: 0.75rem; }
        .doc-canvas-content ul, .doc-canvas-content ol { padding-left: 1.5rem; margin-bottom: 0.75rem; }
        .doc-canvas-content li { font-size: 0.9rem; line-height: 1.75; color: #334155; margin-bottom: 0.35rem; }
        .doc-canvas-content table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: 0.88rem; }
        .doc-canvas-content th { background: #F8FAFC; color: #1E293B; font-weight: 600; padding: 10px 12px; border: 1px solid #E2E8F0; text-align: left; }
        .doc-canvas-content td { padding: 9px 12px; border: 1px solid #E2E8F0; color: #334155; vertical-align: top; }
        .doc-canvas-content tr:nth-child(even) td { background: #F8FAFC; }
        .doc-canvas-content strong { color: #0F172A; font-weight: 700; }
        .doc-canvas-content hr { border: none; border-top: 1.5px solid #E2E8F0; margin: 1.5rem 0; }
      `}</style>

      <div className="app-shell">
        <header className="header">
          <div className="header-left">
            <div className="brand-mark">LF</div>
            <span className="brand-name">LessonForge</span>
          </div>
          <div className="header-right">
            {/* The Toggle Button Switch */}
            <button 
              type="button" 
              className="theme-toggle-btn" 
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            <div className="header-badge">● Workspace Active</div>
          </div>
        </header>

        <main className="main-grid">
          <section className="panel form-panel">
            <div className="form-header">
              <h2 className="form-title">Custom Lesson Builder</h2>
              <p className="form-subtitle">Snap your syllabus &amp; past note, fill in the fields, and generate a school-ready lesson note.</p>
            </div>

            <form onSubmit={generateLessonNote} className="form-body">
              <div className="field-row">
                <div>
                  <label className="field-label">Class</label>
                  <input type="text" placeholder="e.g. SS 1" value={className} onChange={(e) => setClassName(e.target.value)} className="field-input" />
                </div>
                <div>
                  <label className="field-label">Week</label>
                  <input type="text" placeholder="e.g. Week 4" value={week} onChange={(e) => setWeek(e.target.value)} className="field-input" />
                </div>
              </div>

              <div>
                <label className="field-label">Subject</label>
                <input type="text" placeholder="e.g. Data Processing" value={subject} onChange={(e) => setSubject(e.target.value)} className="field-input" />
              </div>

              <div>
                <label className="field-label">Topic <span className="field-label-note">optional if snapping syllabus</span></label>
                <input type="text" placeholder="Leave blank to extract from syllabus photo" value={topic} onChange={(e) => setTopic(e.target.value)} className="field-input" />
              </div>

              <div>
                <label className="field-label">Additional Prompt Directives <span className="field-label-note">pre-generation formatting rules</span></label>
                <textarea 
                  placeholder="e.g., Include extra analytical questions, make the breakdown look very comprehensive, append a grading rubric column, or emphasize local case examples..." 
                  value={customInstructions} 
                  onChange={(e) => setCustomInstructions(e.target.value)} 
                  className="field-textarea"
                />
              </div>

              <div>
                <div className="section-label">
                  <span className="section-label-line" />
                  <span className="section-label-text">Photo References</span>
                  <span className="section-label-line" />
                </div>
              </div>

              <div className="capture-grid">
                <div>
                  <span className="capture-slot-label">① Syllabus Scheme</span>
                  <div className={`capture-slot${syllabusFiles.length > 0 ? ' linked' : ''}`}>
                    <input type="file" accept="image/*" multiple onChange={(e) => handleMultiFileChange(e, setSyllabusFiles)} />
                    <div className="capture-slot-inner">
                      <div className="capture-icon">{syllabusFiles.length > 0 ? '✅' : '📚'}</div>
                      <p className="capture-label-text">{syllabusFiles.length > 0 ? `${syllabusFiles.length} Pages Linked` : 'Snap Syllabus'}</p>
                      <p className="capture-hint">{syllabusFiles.length > 0 ? 'Tap to replace' : 'Up to 5 pages'}</p>
                    </div>
                  </div>
                  {syllabusFiles.length > 0 && (
                    <div className="preview-grid-wrap">
                      <div className="preview-count-label badge-syllabus">Syllabus ({syllabusFiles.length}) ✓</div>
                      {syllabusFiles.map((file, i) => (
                        <img key={i} src={file.preview} className="preview-grid-thumb" alt="Syllabus snippet" />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <span className="capture-slot-label">② School Note Format</span>
                  <div className={`capture-slot${templateFiles.length > 0 ? ' linked-template' : ''}`}>
                    <input type="file" accept="image/*" multiple onChange={(e) => handleMultiFileChange(e, setTemplateFiles)} />
                    <div className="capture-slot-inner">
                      <div className="capture-icon">{templateFiles.length > 0 ? '✅' : '📝'}</div>
                      <p className="capture-label-text">{templateFiles.length > 0 ? `${templateFiles.length} Pages Linked` : 'Snap Past Note'}</p>
                      <p className="capture-hint">{templateFiles.length > 0 ? 'Tap to replace' : 'Up to 5 pages'}</p>
                    </div>
                  </div>
                  {templateFiles.length > 0 && (
                    <div className="preview-grid-wrap">
                      <div className="preview-count-label badge-template">Format ({templateFiles.length}) ✓</div>
                      {templateFiles.map((file, i) => (
                        <img key={i} src={file.preview} className="preview-grid-thumb" alt="Format snippet" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className="forge-btn">
                {!loading && <span className="forge-btn-shimmer" />}
                {loading ? (
                  <>
                    <div className="spinner-inline" />
                    Processing content elements…
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    Forge School Lesson Note
                  </>
                )}
              </button>
            </form>
          </section>

          <section className="panel output-panel">
            <div className="output-header">
              <div className="output-header-left">
                <div className={`output-dot${resultHtml ? '' : ' output-dot-idle'}`} />
                <span className="output-label">Formatted Output Sheet</span>
              </div>

              {resultHtml && (
                <div className="export-actions">
                  <button className="export-btn export-btn-copy" onClick={copyText}>
                    <span>⎘</span> Copy Text
                  </button>
                  <button className="export-btn export-btn-word" onClick={downloadWord}>
                    <span>W</span> Download Word
                  </button>
                  <button className="export-btn export-btn-pdf" onClick={downloadPDF}>
                    <span>↓</span> Download PDF
                  </button>
                </div>
              )}
            </div>

            <div className="output-body">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-ring" />
                  <p className="loading-text">Compiling structural layout &amp; generating export profiles…</p>
                  <div className="loading-bars">
                    <div className="loading-bar" />
                    <div className="loading-bar" />
                    <div className="loading-bar" />
                  </div>
                </div>
              ) : resultHtml ? (
                <div className="doc-canvas">
                  <div className="doc-canvas-stripe" />
                  <div className="doc-canvas-edit-hint">✏️ Live Workspace Editor Active: Click anywhere inside the document below to modify content directly</div>
                  <div 
                    id="note-canvas" 
                    className="doc-canvas-content" 
                    contentEditable="true"
                    suppressContentEditableWarning={true}
                    dangerouslySetInnerHTML={{ __html: resultHtml }} 
                  />
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <p className="empty-text">No document generated yet. Fill in details and click forge to review canvas updates.</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}