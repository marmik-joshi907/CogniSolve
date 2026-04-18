"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState("Customer Support Executive");
  const [username, setUsername] = useState("");

  const handleSignIn = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cognisolve_username", username || "Jane Doe");
      localStorage.setItem("cognisolve_role", role);
    }
    
    if (role === "Customer Support Executive") {
      router.push("/action-center");
    } else if (role === "QA Team Member") {
      router.push("/qa");
    } else if (role === "Operations Manager") {
      router.push("/operations");
    }
  };
  return (
    <main className="flex flex-col items-center justify-center min-h-screen relative w-full">
      {/* Ambient Background Elements */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-fixed-dim blur-[120px] mix-blend-multiply"></div>
        <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary-fixed-dim blur-[140px] mix-blend-multiply"></div>
      </div>
      <div className="relative z-10 w-full max-w-md px-6 py-12 md:py-24 flex flex-col items-center">
        {/* Single Login Card */}
        <div className="w-full glass-panel bg-surface-container-lowest rounded-xl p-8 flex flex-col shadow-[0_12px_40px_rgba(25,28,30,0.06)] relative group">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-primary rounded-t-xl"></div>
          <div className="text-center mb-8">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-primary mb-2">Cognisolve</h1>
            <p className="font-body text-base text-on-surface-variant">Welcome back. Please sign in.</p>
          </div>
          <div className="w-full space-y-5 mb-8">
            <div>
              <label className="block font-label text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">Role</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-surface border border-outline-variant rounded-md px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Customer Support Executive">Customer Support Executive</option>
                  <option value="QA Team Member">QA Team Member</option>
                  <option value="Operations Manager">Operations Manager</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                  <span className="material-symbols-outlined text-xl">expand_more</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block font-label text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">Username</label>
              <input 
                className="w-full bg-surface border border-outline-variant rounded-md px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
                placeholder="Enter username" 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Password</label>
                <a className="text-xs font-semibold text-primary hover:text-primary-container transition-colors" href="#">Forgot password?</a>
              </div>
              <input className="w-full bg-surface border border-outline-variant rounded-md px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="Enter password" type="password" />
            </div>
          </div>
          <button 
            className="w-full py-4 bg-gradient-primary text-on-primary font-label text-sm font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition-opacity"
            onClick={handleSignIn}
          >
            Sign In
          </button>
          <div className="mt-8 pt-6 border-t border-outline-variant text-center">
            <a className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-2" href="#">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>help</span>
              Contact IT support
            </a>
          </div>
        </div>
        <div className="mt-16 text-center">
          <p className="font-label text-xs text-outline tracking-wider uppercase">System Status: Optimal · Version 4.2.0</p>
        </div>
      </div>
    </main>
  );
}
