"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation"; 

export default function Dashboard() {
    const router = useRouter();
    const [token, setToken] = useState(null);
    const [username, setUsername] = useState(null);
    const [posts, setPosts] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteError, setDeleteError] = useState(null);

    useEffect(() => {
        const t = localStorage.getItem("token");

        if (!t) {
            setError("You are not logged in. Please sign in to continue.");
            setLoading(false);
            return;
        }

        setToken(t);

        axios
            .get("https://typeleaf-backend--zainhamid982.replit.app/me", { headers: { Authorization: `Bearer ${t}` } })
            .then((res) => {
                setUsername(res.data.user.username);
                return res.data.user.id;
            })
            .then((userId) =>
                axios.get(`https://typeleaf-backend--zainhamid982.replit.app/post?author=${userId}`, {
                    headers: { Authorization: `Bearer ${t}` },
                })
            )
            .then((res) => setPosts(res.data.length > 0 ? res.data : []))
            .catch((e) => {
                if (e.response?.status === 401) setError("Session expired. Please log in again.");
                else if (e.response?.status >= 500) setError("Server error. Please try again later.");
                else if (e.code === "ERR_NETWORK") setError("Network error. Please check your connection.");
                else setError("Something went wrong while loading your dashboard.");
            })
            .finally(() => setLoading(false));
            
        axios
            .get("https://typeleaf-backend--zainhamid982.replit.app/save", { headers: { Authorization: `Bearer ${t}` } })
            .then(async (res) => {
                const saved = res.data.saved ?? [];
                if (saved.length === 0) return;

                const postRequests = saved.map((s) =>
                    axios.get(`https://typeleaf-backend--zainhamid982.replit.app/post?id=${s.postId}`)
                        .then((r) => r.data[0])
                        .catch(() => null)
                );

                const results = await Promise.all(postRequests);
                setSavedPosts(results.filter(Boolean));
            })
            .catch(() => {});
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUsername(null);
        router.push("/login"); 
    };

    const onDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;

        setDeletingId(id);
        setDeleteError(null);

        try {
            const response = await axios.delete(
                `https://typeleaf-backend--zainhamid982.replit.app/post/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 204) {
                setPosts((prev) => prev.filter((post) => post._id !== id));
            } else {
                setDeleteError(response.data?.message || "Failed to delete the post.");
            }
        } catch (e) {
            if (e.response?.status === 403) setDeleteError("You don't have permission to delete this post.");
            else if (e.response?.status === 404) {
                setDeleteError("Post not found. It may have already been deleted.");
                setPosts((prev) => prev.filter((post) => post._id !== id));
            } else if (e.code === "ERR_NETWORK") setDeleteError("Network error. Please check your connection.");
            else setDeleteError("Failed to delete the post. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    const onUnsave = async (postId) => {
        const t = localStorage.getItem("token");
        try {
            await axios.delete(`https://typeleaf-backend--zainhamid982.replit.app/unsave/${postId}`, {
                headers: { Authorization: `Bearer ${t}` },
            });
            setSavedPosts((prev) => prev.filter((p) => p._id !== postId));
        } catch (e) {
            alert(e.response?.data?.message || "Failed to unsave post.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-900">Loading your dashboard…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-sm w-full text-center shadow-sm">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                    </div>
                    <h2 className="text-base font-semibold text-gray-900 mb-1">Something went wrong</h2>
                    <p className="text-sm text-gray-900 mb-6">{error}</p>
                    <Link href="/login" className="inline-block w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
                        Go to login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-10">

                <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
                    <div>
                        <p className="text-xs font-medium text-gray-900 uppercase tracking-widest mb-1">Dashboard</p>
                        <h1 className="text-3xl font-semibold text-gray-900">Hello, {username ?? "there"}!</h1>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                        <button 
                            onClick={handleLogout}
                            className="text-sm font-medium text-red-600 border border-red-100 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            Logout
                        </button>
                        <Link href="/posts" className="text-sm font-medium text-gray-900 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                            View posts
                        </Link>
                        <Link href="/editor" className="text-sm font-medium text-white bg-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5">
                            <span className="text-base leading-none">+</span>
                            New post
                        </Link>
                    </div>
                </div>

                {deleteError && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{deleteError}</span>
                        <button onClick={() => setDeleteError(null)} className="ml-auto text-red-400 hover:text-red-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-gray-900 uppercase tracking-widest">My posts</p>
                    <span className="text-xs text-gray-900 bg-gray-100 px-2.5 py-1 rounded-full">
                        {posts.length} {posts.length === 1 ? "post" : "posts"}
                    </span>
                </div>

                {posts.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-2xl py-16 flex flex-col items-center gap-3 text-center mb-10">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-900">You haven't written any posts yet.</p>
                        <Link href="/editor" className="text-sm font-medium text-gray-900 underline underline-offset-2 hover:text-gray-900 transition-colors">
                            Write your first post →
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 mb-10">
                        {posts.map((post, i) => (
                            <div key={post._id} className="group flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-gray-300 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-xs text-gray-900 font-medium w-5 text-right shrink-0">{i + 1}</span>
                                    <div className="min-w-0">
                                        <Link href={`/posts/${post._id}`} className="text-sm font-medium text-gray-900 hover:text-gray-900 transition-colors truncate block">
                                            {post.title}
                                        </Link>
                                        {post.createdAt && (
                                            <p className="text-xs text-gray-900 mt-0.5">
                                                {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Link href={`/editor/${post._id}`} className="text-xs font-medium text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => onDelete(post._id)}
                                        disabled={deletingId === post._id}
                                        className="text-xs font-medium text-red-500 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                    >
                                        {deletingId === post._id ? (
                                            <>
                                                <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                                                Deleting…
                                            </>
                                        ) : "Delete"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Saved Posts Section */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-gray-900 uppercase tracking-widest">Saved posts</p>
                    <span className="text-xs text-gray-900 bg-gray-100 px-2.5 py-1 rounded-full">
                        {savedPosts.length} {savedPosts.length === 1 ? "post" : "posts"}
                    </span>
                </div>

                {savedPosts.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-2xl py-16 flex flex-col items-center gap-3 text-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-900">You haven't saved any posts yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {savedPosts.map((post, i) => (
                            <div key={post._id} className="group flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-gray-300 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-xs text-gray-900 font-medium w-5 text-right shrink-0">{i + 1}</span>
                                    <div className="min-w-0">
                                        <Link href={`/posts/${post._id}`} className="text-sm font-medium text-gray-900 hover:text-gray-900 transition-colors truncate block">
                                            {post.title}
                                        </Link>
                                        {post.createdAt && (
                                            <p className="text-xs text-gray-900 mt-0.5">
                                                {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Link href={`/posts/${post._id}`} className="text-xs font-medium text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                        View
                                    </Link>
                                    <button
                                        onClick={() => onUnsave(post._id)}
                                        className="text-xs font-medium text-red-500 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        Unsave
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}