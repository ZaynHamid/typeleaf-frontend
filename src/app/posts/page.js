"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("https://typeleaf-backend--zainhamid982.replit.app/post")
      .then((res) => {
        setPosts(res.data);
        setAllPosts(res.data);
      })
      .catch((e) => {
        if (e.code === "ERR_NETWORK") {
          setError("Network error. Please check your connection.");
        } else if (e.response?.status >= 500) {
          setError("Server error. Please try again later.");
        } else {
          setError("Failed to load posts. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    const lower = value.toLowerCase();
    setPosts(
      lower
        ? allPosts.filter((p) => p.title.toLowerCase().includes(lower))
        : allPosts
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
          <p
            className="text-sm text-stone-400"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            Loading posts…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-6xl mb-6 text-stone-300">∅</p>
          <h2 className="text-xl font-bold text-stone-800 mb-2">
            Something went wrong
          </h2>
          <p
            className="text-stone-500 text-sm mb-8"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-semibold text-stone-800 border-b-2 border-stone-800 pb-0.5 hover:text-stone-500 hover:border-stone-400 transition-colors"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#FAFAF8]"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      <div className="h-[3px] bg-stone-900 w-full" />

      <nav className="border-b border-stone-200 bg-[#FAFAF8] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400 hover:text-stone-900 transition-colors"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            ← Home
          </Link>
          <span
            className="text-xs tracking-widest uppercase text-stone-400"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            All Posts
          </span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6">
        <header className="pt-14 pb-8 border-b border-stone-200">
          <h1 className="text-4xl font-bold text-stone-900 tracking-tight mb-1">
            The Archive
          </h1>
          <p
            className="text-sm text-stone-400 mt-2"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            {allPosts.length} {allPosts.length === 1 ? "post" : "posts"} published
          </p>

          {/* Search */}
          <div className="relative mt-6">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search posts…"
              value={search}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-white text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
              style={{ fontFamily: "system-ui, sans-serif" }}
            />
          </div>
        </header>

        <section className="py-6 pb-24">
          {posts.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-stone-200 rounded-2xl mt-4">
              <p
                className="text-sm text-stone-400"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                {search
                  ? `No posts found for "${search}"`
                  : "No posts yet."}
              </p>
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPosts(allPosts);
                  }}
                  className="mt-3 text-xs font-semibold text-stone-500 underline underline-offset-2 hover:text-stone-800 transition-colors"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {posts.map((post, i) => (
                <li key={post._id}>
                  <Link
                    href={`/posts/${encodeURIComponent(post._id)}`}
                    className="group flex items-start justify-between gap-6 py-5 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <span
                        className="text-xs text-stone-300 font-medium pt-1 w-5 text-right shrink-0 tabular-nums"
                        style={{ fontFamily: "system-ui, sans-serif" }}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-stone-900 leading-snug tracking-tight group-hover:text-stone-600 transition-colors">
                          {post.title}
                        </h2>
                        {(post.author?.username || post.createdAt) && (
                          <p
                            className="text-xs text-stone-400 mt-1"
                            style={{ fontFamily: "system-ui, sans-serif" }}
                          >
                            {post.author?.username && (
                              <span>{post.author.username}</span>
                            )}
                            {post.author?.username && post.createdAt && (
                              <span className="mx-1.5">·</span>
                            )}
                            {post.createdAt && (
                              <span>
                                {new Date(post.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className="text-stone-300 group-hover:text-stone-600 transition-colors mt-1 shrink-0 text-sm"
                      aria-hidden
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {search && posts.length > 0 && (
            <p
              className="text-xs text-stone-400 text-center mt-6"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              {posts.length} result{posts.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo; &mdash;{" "}
              <button
                onClick={() => {
                  setSearch("");
                  setPosts(allPosts);
                }}
                className="underline underline-offset-2 hover:text-stone-700 transition-colors"
              >
                clear
              </button>
            </p>
          )}
        </section>
      </main>

      <div className="h-[2px] bg-stone-100 w-full" />
    </div>
  );
}