import { FaSearch } from "react-icons/fa";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-dark-theme">
      <a href="/" className="text-2xl font-bold">CodeVault</a>
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Search..."
          className="p-2 rounded-md border-2 border-gray-300 dark:border-gray-700 bg-transparent"
        />
        <FaSearch className="text-xl ml-2 text-gray-500 dark:text-gray-400" />
      </div>
    </div>
  );
}
