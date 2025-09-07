import { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

const GeminiMagicButton = ({ value, onChange }) => {
  const [showStar, setShowStar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [starPos, setStarPos] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef();

  // Calculate position of selected text
  const handleSelect = () => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) {
      setShowStar(true);
      setSelectedText(value.substring(start, end));
      // Calculate position
      setTimeout(() => {
        const rect = textarea.getBoundingClientRect();
        const lines = value.substring(0, start).split("\n");
        const lineNum = lines.length - 1;
        const colNum = lines[lineNum].length;
        const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 24;
        const fontWidth = 8.5; // Approximate width per character in monospace
        const top = lineNum * lineHeight + rect.top - textarea.scrollTop + 8;
        const left = colNum * fontWidth + rect.left - textarea.scrollLeft + 8;
        setStarPos({ top, left });
      }, 0);
    } else {
      setShowStar(false);
    }
  };

  // Call Gemini API (correct endpoint and payload)
  const handleGemini = async () => {
    setLoading(true);
    try {
          // Improved prompt: add context for Gemini
          const fullPrompt = `Here is some text from a note:
          """
          ${selectedText}
          """
          Instruction: ${prompt}
          Please provide a clear, well-formatted markdown response.`;
          const res = await fetch("http://localhost:5001/api/gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: fullPrompt
            })
          });
      const data = await res.json();
      // Debug: log the Gemini response
      console.log("Gemini response:", data);
      // Extract text from Gemini response
      const newText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!newText) {
        alert("Gemini did not return any output. Try a different prompt.");
        setLoading(false);
        return;
      }
      // Replace selected text
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const updated = value.substring(0, start) + newText + value.substring(end);
      onChange(updated);
      setShowModal(false);
      setShowStar(false);
      setPrompt("");
    } catch (e) {
      alert("Gemini API error");
    } finally {
      setLoading(false);
    }
  };

  // Recalculate star position on scroll/resize
  useEffect(() => {
    const textarea = textareaRef.current;
    const handleScroll = () => handleSelect();
    window.addEventListener("resize", handleSelect);
    textarea?.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("resize", handleSelect);
      textarea?.removeEventListener("scroll", handleScroll);
    };
  }, [value]);

  return (
  <div className="relative">
    {/* Only show the rendered markdown preview, not the raw code above */}
    <div className="p-2 bg-base-200 rounded text-base-content prose prose-invert max-w-none">
      <ReactMarkdown>{value}</ReactMarkdown>
    </div>
    <textarea
      ref={textareaRef}
      value={value}
      onChange={e => onChange(e.target.value)}
      onSelect={handleSelect}
      className="w-full bg-transparent text-lg focus:outline-none resize-none text-base-content/80 font-mono"
      rows={10}
      style={{ minHeight: 200 }}
    />
    {showStar && (
      <button
        style={{ position: "absolute", top: starPos.top, left: starPos.left, zIndex: 100, pointerEvents: "auto" }}
        className="bg-primary text-white rounded-full p-2 shadow-lg"
        onClick={() => setShowModal(true)}
      >
        <Sparkles size={20} />
      </button>
    )}
    {showModal && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-base-100 rounded-xl p-6 w-full max-w-md shadow-xl">
          <h2 className="text-xl font-bold mb-2">Gemini Magic</h2>
          <p className="mb-2 text-base-content/70">Selected text:</p>
          <div className="bg-base-200 rounded p-2 mb-4 text-sm font-mono whitespace-pre-wrap">{selectedText}</div>
            <input
              className="input input-bordered w-full mb-4"
              placeholder="Enter your instruction (e.g. Correct grammar)"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !loading) {
                  handleGemini();
                }
              }}
            />
          <div className="flex gap-2 justify-end">
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleGemini} disabled={loading}>
              {loading ? "Thinking..." : "Apply"}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default GeminiMagicButton;
