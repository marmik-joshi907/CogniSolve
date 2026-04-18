import re

filepath = r"c:\Users\Asus\Desktop\Cognisolve\frontend\src\app\operations\page.js"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add state
content = content.replace("const [showProfile, setShowProfile] = useState(false);", "const [showProfile, setShowProfile] = useState(false);\n  const [selectedComplaint, setSelectedComplaint] = useState(null);")

# Add onClick to button
content = content.replace('<button className="text-primary hover:bg-primary/5 p-1.5 rounded-DEFAULT transition-colors" title="View Details">', '<button className="text-primary hover:bg-primary/5 p-1.5 rounded-DEFAULT transition-colors" title="View Details" onClick={() => setSelectedComplaint(comp)}>')

# Also, if they double click row or anything? Not needed, just the button.

# Add the modal component at the end of the main section, right before </main>

modal_jsx = """
      {selectedComplaint && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSelectedComplaint(null)}
          ></div>
          <div className="relative w-full max-w-lg bg-surface-container-lowest h-full shadow-2xl overflow-y-auto animate-slide-in">
            {/* Panel Header */}
            <div className="sticky top-0 bg-surface-container-lowest z-10 px-6 py-5 border-b border-outline-variant/15 flex justify-between items-center">
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">
                  CGN-{selectedComplaint.id}
                </h3>
                <p className="text-xs text-secondary mt-0.5 uppercase tracking-wider">
                  Complaint Detail
                </p>
              </div>
              <button
                className="p-2 hover:bg-surface-container-low rounded-full transition-colors"
                onClick={() => setSelectedComplaint(null)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Meta Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {selectedComplaint.priority} priority
                </span>
                <span className="bg-secondary-container text-on-secondary-container text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {selectedComplaint.category}
                </span>
                <span className="bg-surface-container-high text-secondary text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {selectedComplaint.channel}
                </span>
                <span className="bg-surface text-secondary text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border">
                  {selectedComplaint.status.replace("_", " ")}
                </span>
              </div>

              {/* Complaint Text */}
              <div className="bg-surface p-4 rounded-lg border border-outline-variant/10">
                <h4 className="font-label text-[10px] uppercase tracking-wider text-secondary mb-2">
                  Complaint Text
                </h4>
                <p className="font-body text-sm text-on-surface leading-relaxed">
                  {selectedComplaint.complaint_text}
                </p>
              </div>

              {/* Resolution Recommendation */}
              {selectedComplaint.resolution_text && (
                <div className="bg-[#006d3a]/5 p-4 rounded-lg border border-[#006d3a]/15">
                  <h4 className="font-label text-[10px] uppercase tracking-wider text-[#006d3a] mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      lightbulb
                    </span>
                    AI Resolution Recommendation
                  </h4>
                  <div className="font-body text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                    {selectedComplaint.resolution_text}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface p-3 rounded-lg border border-outline-variant/10">
                  <h4 className="font-label text-[10px] uppercase tracking-wider text-secondary mb-1">
                    Created
                  </h4>
                  <p className="text-xs text-on-surface">
                    {selectedComplaint.created_at
                      ? new Date(selectedComplaint.created_at).toLocaleString()
                      : "—"}
                  </p>
                </div>
                <div className="bg-surface p-3 rounded-lg border border-outline-variant/10">
                  <h4 className="font-label text-[10px] uppercase tracking-wider text-secondary mb-1">
                    Updated
                  </h4>
                  <p className="text-xs text-on-surface">
                    {selectedComplaint.updated_at
                      ? new Date(selectedComplaint.updated_at).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <style jsx>{`
            @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            .animate-slide-in {
                animation: slideIn 0.25s ease-out;
            }
          `}</style>
        </div>
      )}
</main>
"""

content = content.replace("</main>", modal_jsx)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Modal patched via Python.")
