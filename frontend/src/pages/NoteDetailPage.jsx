import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { LoaderIcon, SaveIcon, Trash2Icon } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import toast from "react-hot-toast";

import api from "../lib/axios";
import { formatDate } from "../lib/utils";
import GeminiMagicButton from "../components/GeminiMagicButton";

const NoteDetailPage = () => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${id}`);
        setNote(res.data);
      } catch (error) {
        console.log("Error in fetching note", error);
        toast.error("Failed to fetch the note");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const handleSave = async () => {
    if (!note.title.trim() && !note.content.trim()) {
      toast.error("Note cannot be empty");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/notes/${id}`, note);
      toast.success("Note saved successfully");
    } catch (error) {
      console.log("Error saving the note:", error);
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    setDeleting(true);
    try {
      await api.delete(`/notes/${id}`);
      toast.success("Note deleted");
      navigate("/");
    } catch (error) {
      console.log("Error deleting the note:", error);
      toast.error("Failed to delete note");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center">
        <LoaderIcon className="animate-spin size-10" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Floating Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              className="btn btn-ghost"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>
          <p className="text-sm text-base-content/60">
            Last updated: {formatDate(new Date(note.updatedAt))}
          </p>
          <div className="flex items-center gap-4">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              <SaveIcon className="size-4" />
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              className="btn btn-error btn-outline"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2Icon className="size-4" />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        {/* Note Region - Card Container */}
        <div className="bg-base-100 rounded-2xl shadow-lg p-8 border border-base-300">
          <TextareaAutosize
            placeholder="Note Title"
            className="w-full bg-transparent text-4xl font-bold focus:outline-none resize-none text-base-content mb-4"
            value={note.title}
            onChange={(e) => setNote({ ...note, title: e.target.value })}
          />

          {/* Gemini-powered content editor */}
          <GeminiMagicButton
            value={note.content}
            onChange={content => setNote({ ...note, content })}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteDetailPage;