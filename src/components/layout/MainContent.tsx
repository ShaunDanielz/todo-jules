import { useState, useCallback, useRef } from 'react'; // Added useCallback, useRef
import Toolbar from '../toolbar/Toolbar';
import QuickAddForm from '../forms/QuickAddForm';
import { useHotkeys } from 'react-hotkeys-hook'; // Import useHotkeys
import { useTaskStore } from '../../store/taskStore'; // Import useTaskStore
import TaskTable from '../tasks/TaskTable';
import DetailDrawer from '../drawers/DetailDrawer';
import BulkActionBar from '../toolbar/BulkActionBar'; // Import BulkActionBar
import { AnimatePresence } from 'framer-motion';
import type { Task } from '../../types/task';

const MainContent = () => {
  const [showQuickAddForm, setShowQuickAddForm] = useState(false);
  const [selectedTaskForDrawer, setSelectedTaskForDrawer] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { selectedTaskIds, toggleSelectedTasksStatus } = useTaskStore((state) => ({
    selectedTaskIds: state.selectedTaskIds,
    toggleSelectedTasksStatus: state.toggleSelectedTasksStatus,
  }));
  
  const quickAddFormRef = useRef<{ focusTitleInput: () => void }>(null); // For focusing QuickAddForm

  const toggleQuickAddForm = useCallback(() => {
    setShowQuickAddForm((prev) => {
      const willBeOpen = !prev;
      if (willBeOpen) {
        // Defer focus slightly to ensure form is rendered and ref is set
        setTimeout(() => quickAddFormRef.current?.focusTitleInput(), 0);
      }
      return willBeOpen;
    });
  }, []);

  const closeQuickAddForm = useCallback(() => {
    setShowQuickAddForm(false);
  }, []);

  // Hotkeys
  useHotkeys('n', toggleQuickAddForm, { preventDefault: true });
  useHotkeys('esc', closeQuickAddForm, { enabled: showQuickAddForm }); // Only when form is open
  useHotkeys('d', () => {
    if (selectedTaskIds.length > 0) {
      toggleSelectedTasksStatus();
    }
  }, { preventDefault: true }, [selectedTaskIds, toggleSelectedTasksStatus]);


  const handleTaskRowClick = (task: Task) => {
    setSelectedTaskForDrawer(task);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    // Optionally delay setting task to null to allow animation to finish smoothly
    // setTimeout(() => setSelectedTaskForDrawer(null), 300); // 300ms matches drawer animation
  };

  return (
    <main className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 overflow-y-auto relative">
      <Toolbar onNewTaskClick={toggleQuickAddForm} /> {/* Search focus hotkey will be handled in Toolbar */}
      
      <div className="p-4 md:p-6 flex-grow">
        {showQuickAddForm && <QuickAddForm onClose={closeQuickAddForm} ref={quickAddFormRef} />}
        
        <div className="container mx-auto h-full">
          <TaskTable onTaskRowClick={handleTaskRowClick} />
        </div>
      </div>

      {/* Bulk Action Bar will be rendered here, its visibility is self-managed */}
      <BulkActionBar />

      <AnimatePresence>
        {isDrawerOpen && (
          <DetailDrawer
            task={selectedTaskForDrawer}
            isOpen={isDrawerOpen}
            onClose={handleCloseDrawer}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default MainContent;
