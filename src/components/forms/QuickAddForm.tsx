import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'; // Added useImperativeHandle, forwardRef
import { useTaskStore } from '../../store/taskStore';
import type { Task } from '../../types/task';
import { Check, X } from 'lucide-react';

interface QuickAddFormProps {
  onClose: () => void;
}

// Define the type of the ref methods
export interface QuickAddFormRef {
  focusTitleInput: () => void;
}

const QuickAddForm = forwardRef<QuickAddFormRef, QuickAddFormProps>(({ onClose }, ref) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [repeat, setRepeat] = useState<Task['repeat']>('none'); // Added repeat state
  const addTask = useTaskStore((state) => state.addTask);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Expose focus method via ref
  useImperativeHandle(ref, () => ({
    focusTitleInput: () => {
      titleInputRef.current?.focus();
    }
  }));

  useEffect(() => {
    // Initial focus when component mounts, if desired (N shortcut handles subsequent focuses)
    // titleInputRef.current?.focus(); 
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Title cannot be empty.');
      return;
    }
    addTask({
      title,
      dueDate: dueDate || null,
      priority,
      repeat, // Pass repeat value
      // notes, subtasks will be defaults from store
    });
    setTitle('');
    setDueDate('');
    setPriority('medium');
    setRepeat('none'); // Reset repeat
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-gray-200 dark:bg-gray-700 rounded-md shadow-sm flex flex-wrap gap-3 items-end my-2 transition-all duration-300 ease-in-out"
      aria-labelledby="quick-add-form-title"
    >
      <h3 id="quick-add-form-title" className="sr-only">Quick Add New Task</h3>
      
      <div className="flex-grow min-w-[150px]"> {/* Title input */}
        <label htmlFor="quick-task-title" className="sr-only">Task Title</label>
        <input
          id="quick-task-title"
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title..."
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
          aria-required="true"
        />
      </div>

      <div> {/* Due Date input */}
        <label htmlFor="quick-task-due-date" className="sr-only">Due Date</label>
        <input
          id="quick-task-due-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div> {/* Priority select */}
        <label htmlFor="quick-task-priority" className="sr-only">Priority</label>
        <select
          id="quick-task-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task['priority'])}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div> {/* Repeat select */}
        <label htmlFor="quick-task-repeat" className="sr-only">Repeat</label>
        <select
          id="quick-task-repeat"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value as Task['repeat'])}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
        >
          <option value="none">No Repeat</option>
          <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <button
        type="submit"
        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-700 flex items-center"
      >
        <Check size={18} className="mr-1" /> Save
      </button>
      <button
        type="button"
        onClick={onClose}
        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-700 flex items-center"
      >
        <X size={18} className="mr-1" /> Cancel
      </button>
    </form>
  );
});

export default QuickAddForm;
