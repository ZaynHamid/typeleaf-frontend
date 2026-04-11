"use client";
import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark as cmOneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import axios from "axios";
import Link from "next/link";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle
} from "react-resizable-panels";
import { useRouter } from "next/navigation";

const darkerEditor = EditorView.theme({
  "&": { backgroundColor: "#141416" },

  ".cm-scroller": {
    overflow: "auto"
  },

  ".cm-activeLine": {
    backgroundColor: "#1d1d1f !important",
    outline: "none !important",
    borderLeft: "none !important",
  },

  ".cm-gutters": {
    backgroundColor: "#141416",
    border: "none",
    color: "#4b5563",
  },

  ".cm-content": {
    caretColor: "#fff"
  },

  ".cm-scroller::-webkit-scrollbar": {
    width: "8px"
  },

  ".cm-scroller::-webkit-scrollbar-thumb": {
    background: "#3f3f46",
    borderRadius: "4px"
  },

  ".cm-scroller::-webkit-scrollbar-thumb:hover": {
    background: "#52525b"
  }
});

export default function MarkdownEditor() {
  const [content, setContent] = useState("");
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
  }, []);

  const handleChange = (value) => {
    setContent(value);
    localStorage.setItem("content", value);
  };

  useEffect(() => {
    const storedMarkdown = localStorage.getItem("content");
    if (storedMarkdown) {
      setContent(storedMarkdown);
    }
  }, []);

const handleSave = async () => {
  const title = prompt("Enter title:")?.trim();
  if (!title) return alert("Title is required");

  const tagsInput = prompt("Enter tags (comma separated):")?.trim();
  if (!tagsInput) return alert("Tags are required");

  const tags = tagsInput.split(",").map(tag => tag.trim()).filter(Boolean);

  try {
    const response = await axios.post(
      "https://typeleaf-backend--zainhamid982.replit.appcreate-post",
      { title, body: content, tags },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 201) {
      localStorage.removeItem("content");
      router.push("/dashboard");
    }
  } catch (error) {
    console.log(error)
    const message = error.response?.data?.message || "Something went wrong";
    alert(message);
  }
};

  return (
    <div className="flex flex-col h-screen bg-[#0F0F10] text-white overflow-hidden">

      <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-[#262628] bg-[#1A1A1C] space-y-2 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-300">TypeLeaf</h1>

        <div className="flex space-x-2">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Cancel
          </Link>

          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>

      <PanelGroup direction="horizontal" className="flex-1">

        <Panel defaultSize={50} minSize={20}>
          <div className="h-full border-r border-[#262628] overflow-auto">
            <CodeMirror
              value={content}
              height="100%"
              theme={cmOneDark}
              extensions={[markdown(), darkerEditor, EditorView.lineWrapping]}
              onChange={handleChange}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLine: true
              }}
            />
          </div>
        </Panel>

        <PanelResizeHandle className="w-2 bg-[#262628] hover:bg-blue-500 cursor-col-resize flex items-center justify-center transition-colors">
          <div className="w-1 h-10 bg-gray-500 rounded"></div>
        </PanelResizeHandle>

        <Panel defaultSize={50} minSize={20}>
          <div className="h-full p-4 md:p-10 overflow-auto bg-[#1A1A1C]">
            <MarkdownRenderer body={content} />
          </div>
        </Panel>

      </PanelGroup>
    </div>
  );
}
