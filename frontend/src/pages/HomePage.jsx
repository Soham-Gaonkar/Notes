import {useEffect, useState} from "react";
import Navbar from "../components/Navbar";
import RateLimitedUI from "../components/RateLimitedUI";
import NoteCard from "../components/NoteCard";
import api from "../lib/axios";// axios instance
import toast from "react-hot-toast";
import NotesNotFound from "../components/NotesNotFound";

const QUOTES = [
  "Stay curious. Stay creative.",
  "Small steps every day lead to big results.",
  "Your notes are your superpower!",
  "Write it down, make it happen.",
  "Ideas become reality when you capture them.",
  "A clear mind starts with a clear note.",
  "Progress, not perfection.",
  "Every great project starts with a single note.",
];

const HomePage = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const response = await api.get("/notes");
        console.log(response.data);
        setNotes(response.data);
        setIsRateLimited(false);// we are able to get data
      } catch (error) {
        console.error("Error fetching notes:", error);
        if(error.response.status === 429){
          setIsRateLimited(true);
        }
        else{
          toast.error("Something went wrong , failed to load notes ;-; ");
          }
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  return <div className="min-h-screen">
    <Navbar />
    {/* Fun Motivational Quote Banner */}
    <div className="w-full flex justify-center mt-4">
      <div className="bg-base-200 rounded-full px-6 py-2 shadow text-lg font-mono text-primary text-center border border-primary/30 animate-fade-in">
        {quote}
      </div>
    </div>
    {isRateLimited && <RateLimitedUI />}
    <div className="max-w-7xl mx-auto p-4 mt-6">
      {loading && <div className="text-center text-primary py-10">Loading...</div>}
      {notes.length === 0 && !loading && !isRateLimited && <NotesNotFound />}
      {notes.length > 0 && !isRateLimited && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <NoteCard key={note._id} note={note} setNotes={setNotes} />
          ))}
        </div>
      )}
    </div>
  </div>;
};
export default HomePage;