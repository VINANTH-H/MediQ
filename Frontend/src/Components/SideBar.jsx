import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen border-r p-6">

      <h2 className="text-2xl font-bold mb-8">
        Book-My-Doc
      </h2>

      <nav className="flex flex-col gap-3">

        <Link to="/user/chat">
          Chat
        </Link>

        <Link to="/user/doctors">
          Doctors
        </Link>

        <Link to="/user/appointments">
          My Appointments
        </Link>

        <Link to="/user/profile">
          Profile
        </Link>

      </nav>

    </aside>
  );
}

export default Sidebar;