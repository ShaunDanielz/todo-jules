import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, PlusCircle } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTaskStore } from '../../store/taskStore';
import type { Task } from '../../types/task';
import { useState, useEffect, useCallback } from 'react';

interface DetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const DetailDrawer = ({ task, isOpen, onClose }: DetailDrawerProps) => {
  useHotkeys('esc', onClose, { enabled: isOpen });

  const { 
    updateTask, 
    addSubtask, 
    toggleSubtaskStatus, 
    deleteSubtask 
  } = useTaskStore((state) => ({
    updateTask: state.updateTask,
    addSubtask: state.addSubtask,
    toggleSubtaskStatus: state.toggleSubtaskStatus,
    deleteSubtask: state.deleteSubtask,
  }));

  // Local state for editable fields to avoid updating store on every keystroke
  const [editableTitle, setEditableTitle] = useState('');
  const [editableNotes, setEditableNotes] = useState('');
  const [editableDueDate, setEditableDueDate] = useState<string | null>(null);
  const [editablePriority, setEditablePriority] = useState<Task['priority']>('medium');
  const [editableStatus, setEditableStatus] = useState<Task['status']>('pending');
  const [editableRepeat, setEditableRepeat] = useState<Task['repeat']>('none');
  const [newSubtaskText, setNewSubtaskText] = useState('');

  useEffect(() => {
    if (task) {
      setEditableTitle(task.title);
      setEditableNotes(task.notes || '');
      setEditableDueDate(task.dueDate || ''); // Keep as string for input[type=date]
      setEditablePriority(task.priority);
      setEditableStatus(task.status);
      setEditableRepeat(task.repeat || 'none');
    }
  }, [task]);

  const handleUpdate = (field: keyof Task, value: any) => {
    if (task) {
      updateTask(task.id, { [field]: value });
    }
  };
  
  const handleBlur = <K extends keyof Task>(field: K, value: Task[K]) => {
    if (task && task[field] !== value) {
        // For date, ensure null if empty string
        if (field === 'dueDate' && value === '') {
            handleUpdate(field, null);
        } else {
            handleUpdate(field, value);
        }
    }
  };


  const handleAddSubtask = () => {
    if (task && newSubtaskText.trim()) {
      addSubtask(task.id, newSubtaskText.trim());
      setNewSubtaskText('');
    }
  };

  if (!task) {
    return null; // Or a different kind of animation/placeholder if needed when task is null but isOpen is true
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? '0%' : '100%' }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed inset-y-0 right-0 z-30 w-full max-w-md h-full bg-white dark:bg-gray-800 shadow-xl flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 id="drawer-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Task Details
        </h2>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close task details"
        >
          <X size={24} />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-grow p-4 overflow-y-auto space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input
            type="text"
            id="task-title"
            value={editableTitle}
            onChange={(e) => setEditableTitle(e.target.value)}
            onBlur={() => handleBlur('title', editableTitle)}
            onKeyDown={(e) => e.key === 'Enter' && handleBlur('title', editableTitle)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="task-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
          <textarea
            id="task-notes"
            value={editableNotes}
            onChange={(e) => setEditableNotes(e.target.value)}
            onBlur={() => handleBlur('notes', editableNotes)}
            rows={4}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
          <input
            type="date"
            id="task-due-date"
            value={editableDueDate || ''} // Ensure empty string for input if null
            onChange={(e) => {
              setEditableDueDate(e.target.value);
              handleBlur('dueDate', e.target.value); // Update on change for date
            }}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Priority */}
            <div>
              <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                id="task-priority"
                value={editablePriority}
                onChange={(e) => {
                  const newPriority = e.target.value as Task['priority'];
                  setEditablePriority(newPriority);
                  handleUpdate('priority', newPriority);
                }}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="task-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                id="task-status"
                value={editableStatus}
                onChange={(e) => {
                  const newStatus = e.target.value as Task['status'];
                  setEditableStatus(newStatus);
                  handleUpdate('status', newStatus);
                }}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            {/* Repeat */}
            <div>
              <label htmlFor="task-repeat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Repeat</label>
              <select
                id="task-repeat"
                value={editableRepeat}
                onChange={(e) => {
                  const newRepeat = e.target.value as Task['repeat'];
                  setEditableRepeat(newRepeat);
                  handleUpdate('repeat', newRepeat);
                }}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
        </div>


        {/* Subtasks */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Subtasks</h3>
          <ul className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-1">
            {task.subtasks?.map((subtask) => (
              <li key={subtask.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => toggleSubtaskStatus(task.id, subtask.id)}
                    className="h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 mr-2"
                  />
                  <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
                    {subtask.text}
                  </span>
                </div>
                <button
                  onClick={() => deleteSubtask(task.id, subtask.id)}
                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full focus:outline-none focus:ring-1 focus:ring-red-500"
                  aria-label={`Delete subtask ${subtask.text}`}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              placeholder="Add new subtask..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
              className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleAddSubtask}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center"
              aria-label="Add new subtask"
            >
              <PlusCircle size={18} className="mr-1" /> Add
            </button>
          </div>
        </div>

        {/* Attachments Placeholder */}
        <div>
          <label htmlFor="task-attachments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attachments</label>
          <input type="file" id="task-attachments" disabled className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800 disabled:opacity-50" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Feature coming soon.</p>
        </div>

        {/* Audit History Placeholder */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-1">Audit History</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Feature coming soon.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default DetailDrawer;
