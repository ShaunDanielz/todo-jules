import { Sun, Moon, LayoutDashboard, CheckCircle, CalendarDays, ListTodo } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import type { Task } from '../../types/task';
import { useMemo } from 'react';

interface SidebarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Badge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  return (
    <span className="ml-auto text-xs font-semibold bg-blue-500 text-white px-2 py-0.5 rounded-full">
      {count}
    </span>
  );
};

const Sidebar = ({ theme, toggleTheme }: SidebarProps) => {
  const tasks = useTaskStore((state) => state.tasks);

  const counts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayCount = 0;
    let upcomingCount = 0;

    tasks.forEach((task: Task) => {
      if (task.status === 'pending' && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate.getTime() === today.getTime()) {
          todayCount++;
        } else if (dueDate.getTime() > today.getTime()) {
          upcomingCount++;
        }
      }
    });
    return { today: todayCount, upcoming: upcomingCount, all: tasks.length, completed: tasks.filter(t => t.status === 'completed').length };
  }, [tasks]);


  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'All Tasks', count: counts.all },
    { icon: <ListTodo size={20} />, label: 'Today', count: counts.today },
    { icon: <CalendarDays size={20} />, label: 'Upcoming', count: counts.upcoming },
    { icon: <CheckCircle size={20} />, label: 'Completed', count: counts.completed },
  ];

  return (
    <aside className="hidden md:block w-[260px] bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 transition-colors duration-200">
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-center">TaskMaster</h1>
        </div>
        <nav className="flex-grow">
          <ul>
            {navItems.map((item) => (
              <li key={item.label} className="mb-2">
                <a
                  href="#"
                  className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  aria-current={item.label === 'All Tasks' ? 'page' : undefined} // Example for current page indication
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                  <Badge count={item.count} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto"> {/* Pushes button to the bottom */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label={theme === 'light' ? 'Activate dark theme' : 'Activate light theme'}
          >
            {theme === 'light' ? <Moon size={20} className="mr-2" /> : <Sun size={20} className="mr-2" />}
            <span>Toggle Theme</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
