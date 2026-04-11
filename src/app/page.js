import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      <div className="h-[3px] bg-stone-900 w-full" />

      <nav className="border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <span
            className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            TypeLeaf
          </span>
          <div className="flex items-center gap-4" style={{ fontFamily: "system-ui, sans-serif" }}>
            <Link
              href="/login"
              className="text-xs font-semibold tracking-wide text-stone-500 hover:text-stone-900 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="text-xs font-bold tracking-wide uppercase bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-xl">

          <p
            className="text-xs font-semibold tracking-[0.25em] uppercase text-stone-400 mb-6"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            A place to write
          </p>

          <h1 className="text-5xl md:text-6xl font-bold text-stone-900 leading-[1.1] tracking-tight mb-6">
            Write beautifully.<br />Share freely.
          </h1>

          <p
            className="text-base text-stone-500 leading-relaxed mb-10 max-w-sm mx-auto"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            TypeLeaf is a clean, distraction-free space for writing and publishing your ideas in Markdown.
          </p>

          <div className="flex items-center justify-center gap-3" style={{ fontFamily: "system-ui, sans-serif" }}>
            <Link
              href="/signup"
              className="px-6 py-3 text-sm font-bold tracking-wide uppercase bg-stone-900 text-white rounded-xl hover:bg-stone-700 transition-colors"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 text-sm font-semibold text-stone-600 border border-stone-200 rounded-xl hover:border-stone-400 hover:text-stone-900 transition-colors bg-white"
            >
              Login
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-stone-200 py-5">
        <p
          className="text-center text-xs text-stone-400 tracking-wide"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          © {new Date().getFullYear()} TypeLeaf
        </p>
      </footer>

    </div>
  )
}