import { PlusCircle, Upload, ListChecks, HelpCircle, Search } from 'lucide-react'; // Added Search
import { useRef, useState } from 'react'; // Added useRef, useState
import { useHotkeys } from 'react-hotkeys-hook'; // Import useHotkeys


interface ToolbarProps {
  onNewTaskClick: () => void;
}

const Toolbar = ({ onNewTaskClick }: ToolbarProps) => {
  const [searchTerm, setSearchTerm] = useState(''); // Local state for search
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Hotkeys for search focus
  useHotkeys(['/', 's'], (event) => {
    event.preventDefault();
    searchInputRef.current?.focus();
  }, { preventDefault: true });


  const buttons = [
    {
      id: 'new-task',
      label: 'New Task',
      icon: <PlusCircle size={18} className="mr-2" />,
      onClick: onNewTaskClick,
      className: "bg-blue-500 hover:bg-blue-600 text-white",
    },
    {
      id: 'import-csv',
      label: 'Import CSV',
      icon: <Upload size={18} className="mr-2" />,
      onClick: () => alert('Import CSV clicked (not implemented)'),
      className: "bg-green-500 hover:bg-green-600 text-white",
    },
    {
      id: 'bulk-edit',
      label: 'Bulk Edit',
      icon: <ListChecks size={18} className="mr-2" />,
      onClick: () => alert('Bulk Edit clicked (not implemented)'),
      className: "bg-yellow-500 hover:bg-yellow-600 text-white",
    },
    {
      id: 'help',
      label: 'Help',
      icon: <HelpCircle size={18} className="mr-2" />,
      onClick: () => alert('Help clicked (not implemented)'),
      className: "bg-gray-500 hover:bg-gray-600 text-white",
    },
  ];

  return (
    <div className="py-2 px-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 sticky top-0 z-10 flex items-center justify-between space-x-2">
      <div className="flex items-center space-x-2">
        {buttons.map((button) => (
          <button
            key={button.id}
            onClick={button.onClick}
            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors duration-150 ${button.className}`}
          >
            {button.icon}
            {button.label}
          </button>
        ))}
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-gray-400 dark:text-gray-500" />
        </div>
        <input 
          ref={searchInputRef}
          type="text"
          placeholder="Search tasks... (S or /)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white w-64"
        />
      </div>
    </div>
  );
};

export default Toolbar;
