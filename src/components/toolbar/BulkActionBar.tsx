import { useTaskStore } from '../../store/taskStore';
import { CheckCircle, TriangleAlert, Trash2, XCircle } from 'lucide-react';
import type { Task } from '../../types/task'; // For priority type

const BulkActionBar = () => {
  const {
    selectedTaskIds,
    markSelectedTasksComplete,
    setSelectedTasksPriority,
    deleteSelectedTasks,
    deselectAllTasks,
  } = useTaskStore((state) => ({
    selectedTaskIds: state.selectedTaskIds,
    markSelectedTasksComplete: state.markSelectedTasksComplete,
    setSelectedTasksPriority: state.setSelectedTasksPriority,
    deleteSelectedTasks: state.deleteSelectedTasks,
    deselectAllTasks: state.deselectAllTasks,
  }));

  if (selectedTaskIds.length === 0) {
    return null;
  }

  const handleSetPriorityHigh = () => {
    setSelectedTasksPriority('high');
    // deselectAllTasks(); // Store actions already handle this
  };

  const handleMarkComplete = () => {
    markSelectedTasksComplete();
    // deselectAllTasks(); // Store actions already handle this
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTaskIds.length} task(s)? This action cannot be undone.`)) {
      deleteSelectedTasks();
      // deselectAllTasks(); // Store actions already handle this
    }
  };

  return (
    <div 
      className="sticky bottom-0 left-0 right-0 z-20 bg-blue-600 dark:bg-blue-700 text-white p-3 shadow-lg flex items-center justify-between transition-all duration-300 ease-in-out"
      role="toolbar"
      aria-label="Bulk task actions"
      aria-live="polite" // Announce appearance/disappearance and content changes
    >
      <div className="flex items-center flex-wrap gap-2"> {/* Added flex-wrap and gap for responsiveness */}
        <span className="font-semibold mr-2" id="bulk-action-count">{selectedTaskIds.length} task(s) selected</span>
        <button
          onClick={handleMarkComplete}
          className="flex items-center px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-green-300"
          aria-label="Mark selected tasks as complete"
          aria-describedby="bulk-action-count"
        >
          <CheckCircle size={16} className="mr-1" /> Mark Complete
        </button>
        <button
          onClick={handleSetPriorityHigh}
          className="flex items-center px-3 py-1.5 text-sm bg-yellow-500 hover:bg-yellow-600 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          aria-label="Set priority of selected tasks to high"
          aria-describedby="bulk-action-count"
        >
          <TriangleAlert size={16} className="mr-1" /> Set Priority (High)
        </button>
        <button
          onClick={handleDeleteSelected}
          className="flex items-center px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-300"
          aria-label="Delete selected tasks"
          aria-describedby="bulk-action-count"
        >
          <Trash2 size={16} className="mr-1" /> Delete
        </button>
      </div>
      <button
        onClick={deselectAllTasks}
        className="p-2 hover:bg-blue-500 dark:hover:bg-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
        aria-label="Deselect all tasks"
      >
        <XCircle size={20} />
      </button>
    </div>
  );
};

export default BulkActionBar;
