"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Trash2, ShieldCheck, AlertTriangle, Send } from "lucide-react";

interface Comment {
  id: string;
  username: string;
  content: string;
  createdAt: string;
}

export function StoredXSSClient({
  comments: initialComments,
  isSecure = false,
}: {
  comments: Comment[];
  isSecure?: boolean;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [username, setUsername] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // Execute injected script tags inside vulnerable comments (mimicking real browser rendering of stored HTML)
  useEffect(() => {
    if (isSecure || !commentsContainerRef.current) return;

    const scriptNodes = commentsContainerRef.current.querySelectorAll(".vulnerable-comment-content script");
    scriptNodes.forEach((oldScript) => {
      if ((oldScript as any).__xss_executed) return;
      (oldScript as any).__xss_executed = true;

      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [comments, isSecure]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !content.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/labs/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labId: "stored-xss-comments",
          username,
          content,
        }),
      });
      const data = await res.json();
      if (data?.comment) {
        setComments((prev) => [data.comment, ...prev]);
      }
      setContent("");
      router.refresh();
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetReviews = async () => {
    setClearing(true);
    try {
      await fetch("/api/labs/comments?labId=stored-xss-comments", {
        method: "DELETE",
      });
      setComments([]);
      router.refresh();
    } catch (err) {
      console.error("Failed to reset reviews:", err);
    } finally {
      setClearing(false);
    }
  };

  const setPayload = (payload: string) => {
    setUsername("Attacker");
    setContent(payload);
  };

  const accentBorder = isSecure ? "focus:border-neon-green/50" : "focus:border-neon-blue/50";
  const btnStyle = isSecure
    ? "bg-neon-green/20 text-neon-green border-neon-green/30 hover:bg-neon-green/30"
    : "bg-neon-blue/20 text-neon-blue border-neon-blue/30 hover:bg-neon-blue/30";

  return (
    <>
      {/* Comment Form */}
      <div className={`glass rounded-xl p-6 mb-6 ${isSecure ? "glow-green" : ""}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            Write a Review
          </h2>
          {!isSecure && (
            <div className="flex items-center gap-1.5 text-xs text-cyber-400">
              <span className="text-neon-cyan font-semibold">Quick Payloads:</span>
              <button
                type="button"
                onClick={() => setPayload("<img src=x onerror=alert('StoredXSS')>")}
                className="px-2 py-0.5 rounded bg-cyber-800 hover:bg-cyber-700 text-neon-green font-mono text-[11px] border border-cyber-700 transition-colors"
                title="Inject Image Onerror Payload"
              >
                &lt;img onerror&gt;
              </button>
              <button
                type="button"
                onClick={() => setPayload("<script>alert('StoredXSS')</script>")}
                className="px-2 py-0.5 rounded bg-cyber-800 hover:bg-cyber-700 text-neon-yellow font-mono text-[11px] border border-cyber-700 transition-colors"
                title="Inject Script Tag Payload"
              >
                &lt;script&gt;
              </button>
              <button
                type="button"
                onClick={() => setPayload("<svg onload=alert('StoredXSS')>")}
                className="px-2 py-0.5 rounded bg-cyber-800 hover:bg-cyber-700 text-neon-red font-mono text-[11px] border border-cyber-700 transition-colors"
                title="Inject SVG Onload Payload"
              >
                &lt;svg onload&gt;
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name or handle"
            className={`w-full px-4 py-3 bg-cyber-900 border border-cyber-700 rounded-lg text-white placeholder-cyber-600 focus:outline-none ${accentBorder}`}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your review... Try injecting HTML or script tags!"
            rows={4}
            className={`w-full px-4 py-3 bg-cyber-900 border border-cyber-700 rounded-lg text-white placeholder-cyber-600 focus:outline-none ${accentBorder} resize-none font-mono text-sm`}
          />
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2 border rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 ${btnStyle}`}
            >
              <Send className="w-4 h-4" />
              {submitting ? "Posting..." : "Post Review"}
            </button>

            <button
              type="button"
              onClick={handleResetReviews}
              disabled={clearing || comments.length === 0}
              className="px-3 py-1.5 text-xs text-cyber-500 hover:text-neon-red transition-colors flex items-center gap-1.5 disabled:opacity-40"
              title="Clear all stored comments from database"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {clearing ? "Resetting..." : "Reset Reviews"}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="glass rounded-xl p-6" ref={commentsContainerRef}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Reviews ({comments.length})
          </h2>
          {isSecure && (
            <span className="badge-low px-3 py-1 rounded-full text-xs font-semibold">
              OUTPUT ENCODED (SECURE)
            </span>
          )}
        </div>

        {isSecure && (
          <div className="mb-4 p-3 bg-neon-green/5 border border-neon-green/20 rounded-lg">
            <p className="text-xs text-neon-green font-mono">
              ✅ Secure: User comments are safely rendered using React&apos;s JSX text node encoding. HTML tags and scripts are displayed as harmless text.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {comments.length === 0 && (
            <p className="text-cyber-500 text-center py-4">
              No reviews yet. Be the first to share your experience!
            </p>
          )}
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-cyber-900/50 rounded-lg border border-cyber-800"
            >
              <div className="flex items-center justify-between mb-2">
                {isSecure ? (
                  <strong className="text-white">
                    {comment.username}
                  </strong>
                ) : (
                  <strong
                    className="text-white"
                    dangerouslySetInnerHTML={{ __html: comment.username }}
                  />
                )}
                <span className="text-xs text-cyber-600">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              {isSecure ? (
                <div className="text-cyber-300 text-sm whitespace-pre-wrap">
                  {comment.content}
                </div>
              ) : (
                <div
                  className="vulnerable-comment-content text-cyber-300 text-sm"
                  dangerouslySetInnerHTML={{ __html: comment.content }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

