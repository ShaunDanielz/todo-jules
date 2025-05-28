import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task } from '../types/task';
import { v4 as uuidv4 } from 'uuid';

interface TaskStore {
  tasks: Task[];
  addTask: (taskData: Omit<Task, 'id' | 'status' | 'subtasks' | 'repeat'> & Partial<Pick<Task, 'subtasks' | 'repeat'>>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskStatus: (taskId: string) => void;
  setTaskPriority: (taskId: string, priority: Task['priority']) => void;
  addSubtask: (taskId: string, subtaskText: string) => void;
  toggleSubtaskStatus: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  setTasks: (tasks: Task[]) => void;
  // New state and actions for bulk operations
  selectedTaskIds: string[];
  toggleTaskSelection: (taskId: string) => void;
  selectAllTasks: (taskIds: string[]) => void;
  deselectAllTasks: () => void;
  // getSelectedTasks: () => Task[]; // Selector will be implemented outside or via get()
  markSelectedTasksComplete: () => void;
  setSelectedTasksPriority: (priority: Task['priority']) => void;
  deleteSelectedTasks: () => void;
  toggleSelectedTasksStatus: () => void; // New action for 'D' shortcut
}

const TASKS_STORAGE_KEY = 'TASKS_STORAGE_KEY';

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      selectedTaskIds: [], // Initialize selectedTaskIds
      addTask: (taskData) => {
        const newTask: Task = {
          id: uuidv4(),
          ...taskData,
          status: 'pending',
          subtasks: taskData.subtasks || [],
          repeat: taskData.repeat || 'none',
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },
      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
        }));
      },
      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        }));
      },
      toggleTaskStatus: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' }
              : task
          ),
        }));
      },
      setTaskPriority: (taskId, priority) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, priority } : task
          ),
        }));
      },
      addSubtask: (taskId, subtaskText) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: [
                    ...(task.subtasks || []),
                    { id: uuidv4(), text: subtaskText, completed: false },
                  ],
                }
              : task
          ),
        }));
      },
      toggleSubtaskStatus: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: (task.subtasks || []).map((subtask) =>
                    subtask.id === subtaskId
                      ? { ...subtask, completed: !subtask.completed }
                      : subtask
                  ),
                }
              : task
          ),
        }));
      },
      deleteSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: (task.subtasks || []).filter(
                    (subtask) => subtask.id !== subtaskId
                  ),
                }
              : task
          ),
        }));
      },
      setTasks: (tasks) => {
        set({ tasks });
      },
      // Implement new actions
      toggleTaskSelection: (taskId) => {
        set((state) => ({
          selectedTaskIds: state.selectedTaskIds.includes(taskId)
            ? state.selectedTaskIds.filter((id) => id !== taskId)
            : [...state.selectedTaskIds, taskId],
        }));
      },
      selectAllTasks: (taskIds) => {
        set({ selectedTaskIds: [...new Set([...get().selectedTaskIds, ...taskIds])] }); // Avoid duplicates if some already selected
      },
      deselectAllTasks: () => {
        set({ selectedTaskIds: [] });
      },
      // getSelectedTasks: () => { // This is a selector, better implemented with useTaskStore(state => state.tasks.filter(...))
      //   const { tasks, selectedTaskIds } = get();
      //   return tasks.filter(task => selectedTaskIds.includes(task.id));
      // },
      markSelectedTasksComplete: () => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            state.selectedTaskIds.includes(task.id)
              ? { ...task, status: 'completed' }
              : task
          ),
          selectedTaskIds: [], // Clear selection
        }));
      },
      setSelectedTasksPriority: (priority) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            state.selectedTaskIds.includes(task.id)
              ? { ...task, priority }
              : task
          ),
          selectedTaskIds: [], // Clear selection
        }));
      },
      deleteSelectedTasks: () => {
        set((state) => ({
          tasks: state.tasks.filter(
            (task) => !state.selectedTaskIds.includes(task.id)
          ),
          selectedTaskIds: [], // Clear selection
        }));
      },
      toggleSelectedTasksStatus: () => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            state.selectedTaskIds.includes(task.id)
              ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' }
              : task
          ),
          selectedTaskIds: [], // Clear selection
        }));
      }
    }),
    {
      name: TASKS_STORAGE_KEY,
      partialize: (state) => ({ // Only persist tasks and settings, not transient UI state like selectedTaskIds or notifiedTaskIds
        tasks: state.tasks,
        // Ensure other persistent settings are included here if added later
      }),
    }
  )
);
