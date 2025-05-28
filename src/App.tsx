import { useEffect, useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import { Toaster, toast } from 'react-hot-toast'; // Import Toaster and toast
import { useTaskStore } from './store/taskStore';
import type { Task } from './types/task';

const THEME_PREF_KEY = 'THEME_PREF_KEY';
const NOTIFIED_TASKS_KEY = 'NOTIFIED_TASKS_KEY'; // For simple persistence of notified tasks

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const storedTheme = localStorage.getItem(THEME_PREF_KEY);
    return (storedTheme as 'light' | 'dark') || 'dark'; // Default to dark theme
  });

  const tasks = useTaskStore((state) => state.tasks);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_PREF_KEY, theme);
  }, [theme]);

  // Due/Overdue Notifications Effect
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    let notifiedTaskIds: string[] = JSON.parse(localStorage.getItem(NOTIFIED_TASKS_KEY) || '[]');
    const newlyNotifiedTaskIds: string[] = [];

    tasks.forEach((task: Task) => {
      if (task.status === 'pending' && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0); // Normalize

        if (!notifiedTaskIds.includes(task.id)) { // Check if already notified in this session/load
          if (dueDate.getTime() === today.getTime()) {
            toast(`Task "${task.title}" is due today!`, {
              icon: '🔔',
              id: `due-${task.id}`, // Prevent duplicates for this specific notification type
            });
            newlyNotifiedTaskIds.push(task.id);
          } else if (dueDate.getTime() < today.getTime()) {
            toast.error(`Task "${task.title}" is overdue!`, {
              icon: '🔥',
              id: `overdue-${task.id}`,
            });
            newlyNotifiedTaskIds.push(task.id);
          }
        }
      }
    });
    // Update localStorage with newly notified tasks for this session
    // A more robust solution would involve a backend or more sophisticated client-side tracking
    if (newlyNotifiedTaskIds.length > 0) {
        localStorage.setItem(NOTIFIED_TASKS_KEY, JSON.stringify([...notifiedTaskIds, ...newlyNotifiedTaskIds]));
    }

  }, [tasks]);


  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: '',
          style: {
            margin: '10px',
            background: theme === 'dark' ? '#333' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
            border: theme === 'dark' ? '1px solid #555' : '1px solid #ddd',
          },
        }}
      />
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
      <MainContent />
    </div>
  );
}

export default App;
