import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Shield size={24} />
          <span className="text-xl font-bold">DMCA Takedown Manager</span>
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:text-blue-200">Dashboard</Link></li>
            <li><Link to="/create-notice" className="hover:text-blue-200">Create Notice</Link></li>
            <li><Link to="/cases" className="hover:text-blue-200">Case List</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;