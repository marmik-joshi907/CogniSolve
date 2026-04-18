"use client";
import { useState, useEffect, useRef } from "react";

const SlaTimer = ({ deadline, initialBreached }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isBreached, setIsBreached] = useState(initialBreached);

  useEffect(() => {
    if (!deadline) return;
    const target = new Date(deadline).getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target - now;
      
      if (diff <= 0) {
        setIsBreached(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        setIsBreached(false);
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) return null;

  return (
    <div className={`flex items-center gap-1 text-xs font-bold ${isBreached ? 'text-error bg-error-container/50' : 'text-primary bg-primary-container/30'} px-2 py-1 rounded w-fit`}>
      <span className="material-symbols-outlined text-[14px]">
        {isBreached ? 'warning' : 'timer'}
      </span>
      {isBreached ? 'SLA BREACHED' : `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`}
    </div>
  );
};

export default function ActionCenter() {
  const [complaints, setComplaints] = useState([]);
  const [source, setSource] = useState("web");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // ── Sarvam AI / Microphone state ──
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [transcriptionMeta, setTranscriptionMeta] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    fetchComplaints();
    return () => {
      // Cleanup on unmount
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/complaints");
      const json = await res.json();
      if (json.success) {
        setComplaints(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/complaints/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText, channel: source })
      });
      const data = await res.json();
      if (data.success) {
        setResult({
          ...data.data,
          classification_method: data.classification?.method || 'unknown',
          resolution_method: data.resolution?.method || 'unknown',
        });
        fetchComplaints();
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/complaints/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchComplaints();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── Microphone Recording Functions ──
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        // Build the audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start(250); // collect data every 250ms
      setIsRecording(true);
      setRecordingTime(0);
      setTranscriptionMeta(null);

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access is required for call transcription.\nPlease allow microphone access and try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setTranscribing(true);
    console.log("[CogniSolve] Audio blob size:", audioBlob.size, "bytes, type:", audioBlob.type);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "call_recording.webm");
      formData.append("language_code", "unknown"); // auto-detect

      console.log("[CogniSolve] Sending audio to /api/sarvam/transcribe...");
      const res = await fetch("/api/sarvam/transcribe", {
        method: "POST",
        body: formData,
      });

      console.log("[CogniSolve] Response status:", res.status);
      const data = await res.json();
      console.log("[CogniSolve] Response data:", data);

      if (data.success && data.transcript) {
        setRawText(data.transcript);
        setTranscriptionMeta({
          language: data.language_code,
          confidence: data.language_probability,
        });
      } else if (data.transcript === "") {
        alert("No speech was detected in the recording. Please speak clearly and try again.");
      } else {
        alert("Transcription failed: " + (data.error || data.detail || "Unknown error"));
      }
    } catch (e) {
      console.error("Transcription error:", e);
      alert("Failed to connect to transcription service: " + e.message);
    }
    setTranscribing(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleNav = (e, pageName) => {
    e.preventDefault();
    const roleMapping = {
      "Executive View": "Customer Support Executive",
      "Quality Assurance": "QA Team Member",
      "Operations": "Operations Manager"
    };
    const requiredRole = roleMapping[pageName] || "authorized personnel";
    alert(`Access Restricted: Please login as ${requiredRole} to access this portal.`);
  };

  return (
    <div className="flex min-h-screen w-full bg-surface">
      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40 bg-slate-50 dark:bg-slate-900 py-6 px-4 gap-2">
        <div className="mb-8 px-4">
          <h1 className="font-headline text-indigo-950 dark:text-white font-extrabold text-2xl tracking-tight">Cognisolve</h1>
          <p className="font-body text-xs text-secondary mt-1 uppercase tracking-wider font-semibold">Analytical Authority</p>
        </div>
        
        <button className="mb-6 w-full py-3 px-4 rounded-md bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Analysis
        </button>

        <div className="flex-1 flex flex-col gap-1">
          <a className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm rounded-md font-bold font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="#" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            Executive View
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="/qa">
            <span className="material-symbols-outlined text-[20px]">fact_check</span>
            Quality Assurance
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="/operations">
            <span className="material-symbols-outlined text-[20px]">settings_suggest</span>
            Operations
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="#" onClick={(e) => handleNav(e, 'Analytics')}>
            <span className="material-symbols-outlined text-[20px]">insights</span>
            Analytics
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="/complaint-log">
            <span className="material-symbols-outlined text-[20px]">history_edu</span>
            Complaint Log
          </a>
        </div>

        <div className="mt-auto flex flex-col gap-1 border-t border-slate-200 dark:border-slate-800 pt-4">
          <a className="flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="#" onClick={(e) => handleNav(e, 'Help Center')}>
            <span className="material-symbols-outlined text-[18px]">help_outline</span>
            Help Center
          </a>
          <a className="flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="#" onClick={(e) => handleNav(e, 'Account')}>
            <span className="material-symbols-outlined text-[18px]">person</span>
            Account
          </a>
          <a className="flex items-center gap-3 px-4 py-2 mt-2 text-error hover:bg-error/10 hover:text-error rounded-md font-medium font-['Inter'] text-sm tracking-wide uppercase transition-colors" href="/">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </a>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 relative min-h-screen pb-20 md:pb-0">
        
        {/* TopNavBar Mobile */}
        <header className="md:hidden fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(25,28,30,0.06)] flex justify-between items-center px-4 h-16">
          <div className="font-['Manrope'] font-black text-xl text-indigo-900 dark:text-indigo-50">Cognisolve</div>
          <div className="flex gap-4 items-center">
            <button className="text-indigo-900 dark:text-indigo-100 hover:bg-slate-50 dark:hover:bg-slate-900 p-2 rounded-full transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="text-indigo-900 dark:text-indigo-100 hover:bg-slate-50 dark:hover:bg-slate-900 p-2 rounded-full transition-all">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 h-px w-full absolute bottom-0 opacity-10"></div>
        </header>

        <div className="p-6 md:p-10 pt-24 md:pt-10 max-w-7xl mx-auto space-y-10">
          
          {/* Header */}
          <header className="mb-8">
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Executive Dashboard</h2>
            <p className="font-body text-secondary max-w-2xl">
              Submit complaints, view AI classifications with ML-powered resolution recommendations, and manage the active queue.
            </p>
          </header>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Submission & Real-time Result (Span 4) */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              
              {/* Submission Form */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/15 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-container"></div>
                <h3 className="font-headline font-bold text-lg mb-4 text-on-surface">New Analysis</h3>
                
                <form className="space-y-4">
                  <div>
                    <label className="block font-label text-xs uppercase tracking-wider text-secondary mb-1.5">Complaint Source</label>
                    <select 
                      value={source} 
                      onChange={(e) => {
                        setSource(e.target.value);
                        // Clear any previous recording state when switching
                        if (isRecording) stopRecording();
                        setTranscriptionMeta(null);
                      }}
                      className="w-full bg-surface-container-low border-none rounded-md text-sm p-3 focus:ring-2 focus:ring-primary/20 text-on-surface"
                    >
                      <option value="web">Web Portal</option>
                      <option value="email">Email</option>
                      <option value="call">Direct Call</option>
                    </select>
                  </div>

                  {/* ── Call Recording Panel (Sarvam AI Integration) ── */}
                  {source === "call" && (
                    <div className="relative">
                      <label className="block font-label text-xs uppercase tracking-wider text-secondary mb-1.5">
                        Call Recording
                      </label>
                      <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/10">
                        {/* Recording Controls */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {!isRecording && !transcribing ? (
                              <button
                                type="button"
                                onClick={startRecording}
                                className="w-12 h-12 rounded-full bg-error flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all group"
                                title="Start Recording"
                              >
                                <span className="material-symbols-outlined text-white text-[22px]">
                                  mic
                                </span>
                              </button>
                            ) : isRecording ? (
                              <button
                                type="button"
                                onClick={stopRecording}
                                className="w-12 h-12 rounded-full bg-error flex items-center justify-center shadow-lg animate-pulse hover:scale-105 transition-all"
                                title="Stop Recording"
                              >
                                <span className="material-symbols-outlined text-white text-[22px]">
                                  stop
                                </span>
                              </button>
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                            <div>
                              {isRecording ? (
                                <div>
                                  <p className="text-sm font-bold text-error flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-error rounded-full animate-pulse"></span>
                                    Recording...
                                  </p>
                                  <p className="text-xs text-secondary font-mono">
                                    {formatTime(recordingTime)}
                                  </p>
                                </div>
                              ) : transcribing ? (
                                <div>
                                  <p className="text-sm font-bold text-primary flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px] animate-spin">
                                      progress_activity
                                    </span>
                                    Transcribing via Sarvam AI...
                                  </p>
                                  <p className="text-xs text-secondary">
                                    Converting speech to text
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-sm font-medium text-on-surface">
                                    Tap to record call
                                  </p>
                                  <p className="text-xs text-secondary">
                                    Max 30 seconds • Auto-transcribes
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Live Waveform Animation */}
                        {isRecording && (
                          <div className="flex items-center justify-center gap-[3px] h-8 mb-2">
                            {Array.from({ length: 20 }).map((_, i) => (
                              <div
                                key={i}
                                className="w-[3px] bg-error/80 rounded-full"
                                style={{
                                  animation: `waveform 0.8s ease-in-out ${i * 0.05}s infinite alternate`,
                                  height: "4px",
                                }}
                              ></div>
                            ))}
                          </div>
                        )}

                        {/* Transcription metadata */}
                        {transcriptionMeta && (
                          <div className="flex gap-2 mt-2">
                            <span className="text-[10px] uppercase font-bold text-[#006d3a] bg-[#006d3a]/10 px-2 py-0.5 rounded-sm flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">
                                check_circle
                              </span>
                              Transcribed
                            </span>
                            <span className="text-[10px] uppercase font-bold text-secondary bg-surface px-2 py-0.5 rounded-sm">
                              Lang: {transcriptionMeta.language || "auto"}
                            </span>
                            {transcriptionMeta.confidence > 0 && (
                              <span className="text-[10px] uppercase font-bold text-secondary bg-surface px-2 py-0.5 rounded-sm">
                                Conf:{" "}
                                {(transcriptionMeta.confidence * 100).toFixed(0)}
                                %
                              </span>
                            )}
                          </div>
                        )}

                        {/* Sarvam AI branding */}
                        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-outline-variant/10">
                          <span className="material-symbols-outlined text-[14px] text-secondary">
                            smart_toy
                          </span>
                          <span className="text-[10px] text-secondary font-medium tracking-wider uppercase">
                            Powered by Sarvam AI • saaras:v3
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-label text-xs uppercase tracking-wider text-secondary mb-1.5">
                      {source === "call" ? "Transcribed Text" : "Raw Text"}
                    </label>
                    <textarea 
                      value={rawText} 
                      onChange={(e) => setRawText(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-md text-sm p-3 focus:ring-2 focus:ring-primary/20 text-on-surface resize-none"
                      placeholder={
                        source === "call"
                          ? "Record a call above — text will appear here automatically..."
                          : "Paste complaint text here..."
                      }
                      rows="4"
                    ></textarea>
                  </div>
                  
                  <button 
                    onClick={handleAnalyze} 
                    disabled={loading || transcribing}
                    className="w-full py-3 rounded-md bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold shadow-md hover:shadow-lg transition-all text-sm disabled:opacity-50 flex justify-center items-center gap-2"
                    type="button"
                  >
                    {loading ? (
                      <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Analyzing...</>
                    ) : (
                      <><span className="material-symbols-outlined text-[18px]">memory</span> Analyze Content</>
                    )}
                  </button>
                </form>
              </div>

              {/* AI Result Card */}
              {result && (
                <div className="bg-surface-container-low rounded-xl p-1 relative">
                  <div className="bg-surface-container-lowest p-5 rounded-lg h-full border border-outline-variant/15">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">analytics</span>
                        Analysis Result
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="bg-surface-container-high text-primary text-xs font-bold px-2 py-1 rounded-sm">
                          {(result.confidence_score * 100).toFixed(0)}% CONF
                        </span>
                        <span className="bg-surface-container-high text-secondary text-[10px] font-bold px-2 py-1 rounded-sm uppercase">
                          {result.classification_method}
                        </span>
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-secondary mb-1">
                        <span>Confidence Level</span>
                        <span>{(result.confidence_score * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${result.confidence_score >= 0.8 ? 'bg-[#006d3a]' : result.confidence_score >= 0.6 ? 'bg-[#f59e0b]' : 'bg-error'}`} 
                          style={{ width: `${result.confidence_score * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <span className={`${result.priority === 'high' ? 'bg-error-container text-on-error-container' : result.priority === 'medium' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-[#d1e7dd] text-[#0f5132]'} text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wider`}>
                          {result.priority} priority
                        </span>
                        <span className="bg-secondary-container text-on-secondary-container text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                          {result.category}
                        </span>
                      </div>

                      <div className="bg-surface p-3 rounded-md border border-outline-variant/10">
                         <h4 className="font-label text-[10px] uppercase tracking-wider text-secondary mb-1">Target SLA Deadline</h4>
                         <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                            {new Date(result.sla_deadline).toLocaleString()}
                         </p>
                      </div>

                      {/* Resolution Recommendation */}
                      {result.resolution_text && (
                        <div className="bg-[#006d3a]/5 p-3 rounded-md border border-[#006d3a]/15">
                           <h4 className="font-label text-[10px] uppercase tracking-wider text-[#006d3a] mb-2 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                              AI Resolution Recommendation
                              <span className="text-[9px] bg-[#006d3a]/10 px-1.5 py-0.5 rounded ml-1 uppercase">{result.resolution_method}</span>
                           </h4>
                           <div className="font-body text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">
                              {result.resolution_text}
                           </div>
                        </div>
                      )}

                      <div className="pt-2 flex justify-end gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-primary hover:bg-surface-container rounded-md transition-colors" onClick={() => setResult(null)}>
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Queue (Span 8) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">search</span>
                  <input 
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 text-sm" 
                    placeholder="Search ID, keyword, or category..." 
                    type="text" 
                  />
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-3 bg-surface-container-lowest border border-outline-variant/15 rounded-xl shadow-sm text-sm font-medium text-secondary hover:bg-surface-container-low transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                    Filter
                  </button>
                  <button className="px-4 py-3 bg-surface-container-lowest border border-outline-variant/15 rounded-xl shadow-sm text-sm font-medium text-secondary hover:bg-surface-container-low transition-colors flex items-center gap-2" onClick={fetchComplaints}>
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                  </button>
                </div>
              </div>

              {/* Queue List */}
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 overflow-hidden flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
                <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center">
                  <h3 className="font-headline font-bold text-lg text-on-surface">Active Queue</h3>
                  <span className="text-xs font-label uppercase text-secondary tracking-wider">Showing {complaints.length} items</span>
                </div>
                
                <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 bg-surface/30">
                  <div className="divide-y divide-surface-container-low">
                    {loading && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-surface-container-high overflow-hidden">
                        <div className="h-full bg-primary w-1/3 animate-[slide_1s_ease-in-out_infinite]"></div>
                      </div>
                    )}
                    
                    {complaints.length === 0 ? (
                      <div className="p-12 text-center text-secondary flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-4xl opacity-50">inbox</span>
                        <p className="text-sm">No active complaints found.</p>
                      </div>
                    ) : (
                      complaints.map((comp) => (
                        <div key={comp.id} className="p-5 hover:bg-surface-container-low/50 transition-colors group relative bg-surface-container-lowest mb-2 mx-4 mt-4 rounded-xl shadow-sm border border-outline-variant/10">
                          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                            
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">#{comp.id}</span>
                                  {comp.sla_deadline && (
                                    <SlaTimer deadline={comp.sla_deadline} initialBreached={comp.sla_breached} />
                                  )}
                               </div>
                               <p className="font-body text-sm font-medium text-on-surface mb-3 line-clamp-2 leading-relaxed">
                                 {comp.complaint_text}
                               </p>
                               <div className="flex gap-2 items-center flex-wrap">
                                 <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-secondary bg-surface px-2 py-1 border border-outline-variant/10 rounded">
                                   <span className="material-symbols-outlined text-[12px]">inventory_2</span> {comp.category}
                                 </span>
                                 <span className={`${comp.priority === 'high' ? 'bg-error-container text-on-error-container border-error/20' : comp.priority === 'medium' ? 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary/20' : 'bg-[#d1e7dd] text-[#0f5132] border-[#0f5132]/20'} text-[10px] uppercase font-bold px-2 py-1 border rounded`}>
                                   {comp.priority}
                                 </span>
                                 <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-secondary bg-surface px-2 py-1 border border-outline-variant/10 rounded">
                                   <span className="material-symbols-outlined text-[12px]">
                                     {comp.channel === 'call' ? 'call' : comp.channel === 'email' ? 'mail' : 'laptop_chromebook'}
                                   </span>
                                   {comp.channel}
                                 </span>
                                 {comp.confidence_score && (
                                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-secondary bg-surface px-2 py-1 border border-outline-variant/10 rounded">
                                      {(comp.confidence_score * 100).toFixed(0)}% Conf
                                    </span>
                                 )}
                               </div>
                            </div>
                            
                            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-outline-variant/10">
                              {/* Status Update Buttons */}
                              {comp.status === 'open' && (
                                <button 
                                  onClick={() => handleStatusUpdate(comp.id, 'in_progress')}
                                  className="w-full lg:w-auto px-4 py-2 text-xs font-bold bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                                  Start Processing
                                </button>
                              )}
                              {comp.status === 'in_progress' && (
                                <button 
                                  onClick={() => handleStatusUpdate(comp.id, 'resolved')}
                                  className="w-full lg:w-auto px-4 py-2 text-xs font-bold bg-[#006d3a]/10 text-[#006d3a] rounded hover:bg-[#006d3a]/20 transition-colors flex items-center justify-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                                  Mark Resolved
                                </button>
                              )}
                              
                              <div className={`${comp.status === 'resolved' || comp.status === 'closed' ? 'text-[#006d3a]' : comp.status === 'in_progress' ? 'text-primary' : 'text-secondary'} text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider`}>
                                <span className="material-symbols-outlined text-[16px]">
                                  {comp.status === 'resolved' ? 'check_circle' : comp.status === 'in_progress' ? 'pending' : 'schedule'}
                                </span>
                                {comp.status.replace('_', ' ')}
                              </div>
                            </div>
                          </div>
                          
                          {/* Show resolution if available */}
                          {comp.resolution_text && comp.status !== 'open' && (
                            <div className="mt-4 p-3 bg-[#006d3a]/5 rounded border border-[#006d3a]/15">
                               <p className="text-[10px] uppercase tracking-wider text-[#006d3a] font-bold mb-2 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[14px]">lightbulb</span> Recommended Action Plan
                               </p>
                               <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-line ml-5">
                                 {comp.resolution_text}
                               </p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Waveform animation keyframes */}
      <style jsx>{`
        @keyframes waveform {
          0% { height: 4px; }
          100% { height: 24px; }
        }
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
