import { Link } from "react-router";

const Navbar = () => {
  return (
    <div className="w-full flex justify-center py-4 sticky top-0 z-50">
      <div className="navbar max-w-3xl bg-base-200/80 backdrop-blur-lg rounded-full border border-white/10 px-6">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl font-sans">
            0_0
          </Link>
        </div>
        <div className="flex-none">
          <Link
            to="/create"
            className="btn btn-primary btn-outline rounded-full border-2 hover:bg-primary-focus"
          >
            + New Note
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;