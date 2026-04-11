"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MarkdownRenderer } from "@/app/components/MarkdownRenderer";

function insertReply(comments, parentId, newReply) {
  return comments.map((c) => {
    if (c._id === parentId) {
      return { ...c, replies: [...(c.replies || []), newReply] };
    }
    if (c.replies?.length) {
      return { ...c, replies: insertReply(c.replies, parentId, newReply) };
    }
    return c;
  });
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Avatar({ username, size = "sm" }) {
  const initials = username?.slice(0, 2).toUpperCase() ?? "?";
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div
      className={`${dim} rounded-full bg-stone-200 text-stone-600 font-semibold flex items-center justify-center shrink-0 select-none`}
    >
      {initials}
    </div>
  );
}

function ErrorPill({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-full px-3 py-1 w-fit mt-2">
      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-1 hover:text-red-800 leading-none">✕</button>
      )}
    </div>
  );
}

function Comment({ comment, level = 0, onReplyPosted, token }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyError, setReplyError] = useState(null);
  const { id } = useParams();

  const handleReply = async () => {
    if (!replyText.trim()) return;
    if (!token) { setReplyError("You must be logged in to reply."); return; }
    setPosting(true);
    setReplyError(null);
    try {
      const res = await axios.post(
        "https://typeleaf-backend--zainhamid982.replit.app/comment",
        { postId: id, comment: replyText, parentId: comment._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onReplyPosted(comment._id, res.data.comm);
      setReplyText("");
      setShowReplyBox(false);
    } catch (e) {
      if (e.response?.status === 401) setReplyError("Session expired. Please log in again.");
      else if (e.code === "ERR_NETWORK") setReplyError("Network error. Check your connection.");
      else setReplyError("Failed to post reply. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className={`${level > 0 ? "ml-8 pl-5 border-l-2 border-stone-100" : ""} mt-6`}>
      <div className="flex gap-3">
        <Avatar username={comment.author?.username} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-semibold text-stone-800" style={{ fontFamily: "system-ui, sans-serif" }}>
              {comment.author?.username ?? "Anonymous"}
            </span>
            <span className="text-xs text-stone-400" style={{ fontFamily: "system-ui, sans-serif" }}>
              {timeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="text-stone-600 text-sm leading-relaxed">{comment.text}</p>

          <button
            onClick={() => { setShowReplyBox((p) => !p); setReplyError(null); }}
            className="mt-2 text-xs text-stone-400 hover:text-stone-700 transition-colors font-medium"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            {showReplyBox ? "Cancel" : "↩ Reply"}
          </button>

          {showReplyBox && (
            <div className="mt-3">
              <div className="flex gap-2">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                  placeholder="Write a reply…"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                />
                <button
                  onClick={handleReply}
                  disabled={posting || !replyText.trim()}
                  className="px-4 py-2 text-xs font-bold tracking-wide uppercase bg-stone-900 text-white rounded-lg hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  {posting
                    ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    : "Post"}
                </button>
              </div>
              <ErrorPill message={replyError} onDismiss={() => setReplyError(null)} />
            </div>
          )}

          {comment.replies?.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              level={level + 1}
              onReplyPosted={onReplyPosted}
              token={token}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Post() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [token, setToken] = useState("");
  const [likes, setLikes] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeError, setLikeError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [commentPosting, setCommentPosting] = useState(false);
  const [commentError, setCommentError] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);

    Promise.all([
      axios.get(`https://typeleaf-backend--zainhamid982.replit.app/post?id=${id}`),
      axios.get(`https://typeleaf-backend--zainhamid982.replit.app/comment/${id}`),
      axios.get(`https://typeleaf-backend--zainhamid982.replit.app/likes/${id}`),
    ])
      .then(([postRes, commentRes, likeRes]) => {
        const fetched = postRes.data[0];
        if (!fetched) { setPageError("This post doesn't exist or has been removed."); return; }
        setPost(fetched);
        setComments((commentRes.data.comments ?? []).filter(Boolean).reverse());
        setLikes(likeRes.data.likes);
      })
      .catch((e) => {
        if (e.response?.status === 404) setPageError("Post not found.");
        else if (e.code === "ERR_NETWORK") setPageError("Network error. Please check your connection.");
        else setPageError("Failed to load this post. Please try again.");
      })
      .finally(() => setPageLoading(false));
  }, [id]);

  const handleReplyPosted = (parentId, newReply) =>
    setComments((prev) => insertReply(prev, parentId, newReply));

  const postComment = async () => {
    if (!comment.trim()) return;
    if (!token) { setCommentError("You must be logged in to comment."); return; }
    setCommentPosting(true);
    setCommentError(null);
    try {
      const res = await axios.post(
        "https://typeleaf-backend--zainhamid982.replit.app/comment",
        { postId: id, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => res.data.comm ? [res.data.comm, ...prev] : prev);
      setComment("");
    } catch (e) {
      if (e.response?.status === 401) setCommentError("Session expired. Please log in again.");
      else if (e.code === "ERR_NETWORK") setCommentError("Network error. Check your connection.");
      else setCommentError("Failed to post comment. Please try again.");
    } finally {
      setCommentPosting(false);
    }
  };

  const likePost = async () => {
    if (!token) { setLikeError("Log in to like posts."); return; }
    setLikeLoading(true);
    setLikeError(null);
    try {
      const res = await axios.post(
        "https://typeleaf-backend--zainhamid982.replit.app/like",
        { postId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLikes(res.data.likesCount);
    } catch (e) {
      if (e.response?.status === 401) setLikeError("Session expired.");
      else setLikeError("Couldn't update like. Try again.");
    } finally {
      setLikeLoading(false);
    }
  };

  const toggleSave = async () => {
    if (!token) { setSaveError("Log in to save posts."); return; }
    setSaveLoading(true);
    setSaveError(null);
    try {
      if (isSaved) {
        await axios.delete(`https://typeleaf-backend--zainhamid982.replit.app/unsave/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsSaved(false);
      } else {
        await axios.post(
          "https://typeleaf-backend--zainhamid982.replit.app/save",
          { postId: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsSaved(true);
      }
    } catch (e) {
      if (e.response?.status === 401) setSaveError("Session expired.");
      else setSaveError("Couldn't update. Try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
          <p className="text-sm text-stone-400" style={{ fontFamily: "system-ui, sans-serif" }}>
            Loading article…
          </p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-6xl mb-6 text-stone-300">∅</p>
          <h2 className="text-xl font-bold text-stone-800 mb-2">Something went wrong</h2>
          <p className="text-stone-500 text-sm mb-8">{pageError}</p>
          <a
            href="/"
            className="inline-block text-sm font-semibold text-stone-800 border-b-2 border-stone-800 pb-0.5 hover:text-stone-500 hover:border-stone-400 transition-colors"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            ← Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", color: "#000000" }}>

      <div className="h-[3px] bg-stone-900 w-full" />

      <nav className="border-b border-stone-200 bg-[#FAFAF8] sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <a
            href="/dashboard"
            className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-500 hover:text-stone-900 transition-colors"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            ← Home
          </a>
          {post.category && (
            <span
              className="text-xs tracking-widest uppercase text-stone-400"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              {post.category}
            </span>
          )}
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6">

        <header className="pt-14 pb-10 border-b border-stone-200">
          <h1 className="text-[2.6rem] font-bold text-stone-900 leading-[1.2] tracking-tight mb-7">
            {post.title}
          </h1>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Avatar username={post.author?.username} size="md" />
              <div>
                <p className="text-sm font-semibold text-stone-800" style={{ fontFamily: "system-ui, sans-serif" }}>
                  {post.author?.username ?? "Anonymous"}
                </p>
                {post.createdAt && (
                  <p className="text-xs text-stone-400 mt-0.5" style={{ fontFamily: "system-ui, sans-serif" }}>
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "long", day: "numeric", year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <button
                  onClick={likePost}
                  disabled={likeLoading}
                  className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-rose-500 disabled:opacity-50 transition-colors"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  {likeLoading ? (
                    <div className="w-4 h-4 border border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                  {likes ?? 0}
                </button>
                <ErrorPill message={likeError} onDismiss={() => setLikeError(null)} />
              </div>

              <div className="flex flex-col items-end">
                <button
                  onClick={toggleSave}
                  disabled={saveLoading}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                    isSaved ? "text-stone-900" : "text-stone-400 hover:text-stone-800"
                  }`}
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  {saveLoading ? (
                    <div className="w-4 h-4 border border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  )}
                  {isSaved ? "Saved" : "Save"}
                </button>
                <ErrorPill message={saveError} onDismiss={() => setSaveError(null)} />
              </div>
            </div>
          </div>
        </header>

        <article
          className="py-12 border-b border-stone-200
            prose prose-stone prose-lg max-w-none
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-stone-900
            prose-p:text-stone-700 prose-p:leading-[1.9] prose-p:text-[1.05rem]
            prose-a:text-stone-900 prose-a:underline prose-a:decoration-stone-300 hover:prose-a:decoration-stone-700
            prose-blockquote:border-l-4 prose-blockquote:border-stone-300 prose-blockquote:text-stone-500 prose-blockquote:not-italic
            prose-code:bg-stone-100 prose-code:text-stone-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-img:rounded-xl prose-img:shadow-sm"
        >
          <MarkdownRenderer body={post.body} />
        </article>

        <section className="py-12 pb-24">
          <div className="flex items-baseline gap-3 mb-8">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Discussion</h2>
            {comments.length > 0 && (
              <span className="text-sm text-stone-400" style={{ fontFamily: "system-ui, sans-serif" }}>
                {comments.length} {comments.length === 1 ? "comment" : "comments"}
              </span>
            )}
          </div>

          <div className="mb-12 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
            <textarea
              rows={3}
              value={comment}
              placeholder="Share your thoughts on this article…"
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-sm text-stone-800 placeholder-stone-300 bg-transparent focus:outline-none resize-none leading-relaxed"
              style={{ fontFamily: "system-ui, sans-serif" }}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
              <ErrorPill message={commentError} onDismiss={() => setCommentError(null)} />
              <button
                onClick={postComment}
                disabled={commentPosting || !comment.trim()}
                className="ml-auto px-5 py-2 text-xs font-bold tracking-widest uppercase bg-stone-900 text-white rounded-lg hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                {commentPosting ? (
                  <>
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    Posting…
                  </>
                ) : (
                  "Publish"
                )}
              </button>
            </div>
          </div>

          {comments.length === 0 ? (
            <div className="text-center py-14 border border-dashed border-stone-200 rounded-2xl">
              <p className="text-sm text-stone-400" style={{ fontFamily: "system-ui, sans-serif" }}>
                No comments yet — be the first to respond.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {comments.map((c) => (
                <div key={c._id} className="py-1">
                  <Comment comment={c} onReplyPosted={handleReplyPosted} token={token} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <div className="h-[2px] bg-stone-100 w-full" />
    </div>
  );
}