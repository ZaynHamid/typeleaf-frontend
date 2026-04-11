"use client";
import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark as cmOneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import axios from "axios";
import { MarkdownRenderer } from "../../components/MarkdownRenderer";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

const darkerEditor = EditorView.theme({
    "&": { backgroundColor: "#141416" },
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
    ".cm-content": { caretColor: "#fff" }
});

export default function MarkdownEditor() {
    const [content, setContent] = useState("");
    const [token, setToken] = useState(null);
    const [hasChanged, setHasChanged] = useState(false);
    const { id } = useParams();
    const router = useRouter();

    useEffect(() => {
        const t = localStorage.getItem("token");
        setToken(t);
        axios.get(`https://typeleaf-backend--zainhamid982.replit.app/post?id=${id}`).then(res => setContent(res.data[0].body)).catch(e => console.error(e))
    }, [])

    const handleChange = e => {
        setContent(e);
        setHasChanged(true)
    }

    const handleSave = async () => {
        console.log("Saved Markdown:", content);
        const title = prompt("Enter title: ");

        const response = await axios.put("https://typeleaf-backend--zainhamid982.replit.app/post", {
            postId: id, updates: {
                title: title,
                body: content
            }
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        if (response.status === 200) {
            router.push("/dashboard");
        } else {
            alert(response.data.message);
        }


    };

    return (
        <div className="flex flex-col h-screen bg-[#0F0F10] text-white overflow-hidden">

            <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-[#262628] bg-[#1A1A1C] space-y-2 md:space-y-0">
                <h1 className="text-2xl font-bold text-gray-300">TypeLeaf</h1>
                <div className="flex space-x-2">
                    <Link href="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">
                        Cancel
                    </Link>
                    <button
                        disabled={!hasChanged}
                        className={`px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 ${!hasChanged ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </div>

            <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-[#262628] overflow-auto">
                    <CodeMirror
                        value={content}
                        height="100%"
                        theme={cmOneDark}
                        extensions={[markdown(), darkerEditor]}
                        onChange={e => handleChange(e)}
                        basicSetup={{ lineNumbers: true, highlightActiveLine: true }}
                    />
                </div>

                <div className="w-full md:w-1/2 h-1/2 md:h-full p-4 md:p-10 overflow-auto bg-[#1A1A1C]">
                    <MarkdownRenderer body={content} />
                </div>
            </div>
        </div>
    );
}