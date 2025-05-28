import { useTaskStore } from '../../store/taskStore';
import type { Task } from '../../types/task';
import { MoreHorizontal, ArrowUp, ArrowDown, ChevronsUpDown, GripVertical } from 'lucide-react';
import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableTaskRowProps {
  task: Task;
  onRowClick: (task: Task) => void;
  isSelected: boolean;
  onToggleSelection: (taskId: string) => void;
}

const SortableTaskRow = ({ task, onRowClick, isSelected, onToggleSelection }: SortableTaskRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  const priorityClass = 
    task.priority === 'high' ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100' :
    task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100' :
    'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100';

  const completedClass = task.status === 'completed' 
    ? 'line-through text-gray-500 dark:text-gray-400' 
    : 'text-gray-900 dark:text-gray-100';
  
  const completedRowClass = task.status === 'completed' 
    ? 'bg-gray-50 dark:bg-gray-750 opacity-70' 
    : 'bg-white dark:bg-gray-800';
  
  const repeatText = task.repeat && task.repeat !== 'none' 
    ? task.repeat.charAt(0).toUpperCase() + task.repeat.slice(1) 
    : 'N/A';

  return (
    <tr
      ref={setNodeRef}
      style={style}
      role="row"
      className={`hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150 ${completedRowClass} cursor-pointer`}
      onClick={() => onRowClick(task)}
    >
      <td role="cell" className="px-2 py-3 whitespace-nowrap align-middle">
        <button 
          {...attributes} 
          {...listeners} 
          className="cursor-grab p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
          aria-label={`Drag task ${task.title} to reorder`}
          onClick={(e) => e.stopPropagation()} // Prevent row click when dragging
        >
          <GripVertical size={18} />
        </button>
      </td>
      <td role="cell" className="px-2 py-3 whitespace-nowrap align-middle">
        <input
          type="checkbox"
          role="checkbox"
          aria-label={`Select task ${task.title}`}
          className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-offset-0 dark:focus:ring-offset-gray-800"
          checked={isSelected}
          onChange={() => onToggleSelection(task.id)}
          onClick={(e) => e.stopPropagation()} // Prevent row click when interacting with checkbox
        />
      </td>
      <td role="cell" className={`px-3 py-3 whitespace-nowrap text-sm font-medium align-middle ${completedClass} ${isSelected ? 'font-semibold' : ''}`}>
        {task.title}
      </td>
      <td role="cell" className={`px-3 py-3 whitespace-nowrap text-sm align-middle ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
      </td>
      <td role="cell" className={`px-3 py-3 whitespace-nowrap text-sm align-middle ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityClass}`}>
          {task.priority}
        </span>
      </td>
      <td role="cell" className={`px-3 py-3 whitespace-nowrap text-sm align-middle ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
        {task.status === 'pending' ? 'Pending' : 'Completed'}
      </td>
      <td role="cell" className={`px-3 py-3 whitespace-nowrap text-sm align-middle ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
        {repeatText}
      </td>
      <td role="cell" className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium align-middle">
        <button
          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 rounded-full p-1"
          aria-label={`Actions for ${task.title}`}
          onClick={(e) => { e.stopPropagation(); alert(`Actions for ${task.title} (not implemented)`); }}
        >
          <MoreHorizontal size={20} />
        </button>
      </td>
    </tr>
  );
};

interface TaskTableProps {
  onTaskRowClick: (task: Task) => void;
}

const TaskTable = ({ onTaskRowClick }: TaskTableProps) => {
  const { 
    tasks: storeTasks, 
    setTasks, 
    selectedTaskIds, 
    toggleTaskSelection, 
    selectAllTasks, 
    deselectAllTasks 
  } = useTaskStore((state) => ({
    tasks: state.tasks,
    setTasks: state.setTasks,
    selectedTaskIds: state.selectedTaskIds,
    toggleTaskSelection: state.toggleTaskSelection,
    selectAllTasks: state.selectAllTasks,
    deselectAllTasks: state.deselectAllTasks,
  }));

  const [sortColumn, setSortColumn] = useState<keyof Task | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // DND sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleHeaderClick = (column: keyof Task) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const priorityOrder: Record<Task['priority'], number> = { high: 3, medium: 2, low: 1 };
  const statusOrder: Record<Task['status'], number> = { pending: 1, completed: 2 };

  const sortedTasks = useMemo(() => {
    let tasksToDisplay = [...storeTasks]; // Use storeTasks for sorting
    if (!sortColumn) return tasksToDisplay;

    return tasksToDisplay.sort((a, b) => {
      const aValue = a[sortColumn!];
      const bValue = b[sortColumn!];
      let comparison = 0;

      if (sortColumn === 'priority') {
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortColumn === 'status') {
        comparison = statusOrder[a.status] - statusOrder[b.status];
      } else if (sortColumn === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        if (!dateA && dateB) comparison = 1; // Sort tasks with no due date to the end
        else if (dateA && !dateB) comparison = -1;
        else comparison = dateA - dateB;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [storeTasks, sortColumn, sortDirection]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && over) {
      const oldIndex = storeTasks.findIndex((task) => task.id === active.id);
      const newIndex = storeTasks.findIndex((task) => task.id === over.id);
      
      // D&D should reorder based on the storeTasks (original order before sorting)
      // or, if we want D&D to respect current sort, we'd use sortedTasks as base and then re-sort.
      // For simplicity and common UX, D&D usually modifies the underlying unsorted list.
      const newOrderedTasks = arrayMove(storeTasks, oldIndex, newIndex);
      setTasks(newOrderedTasks); // Update the store
    }
  };
  
  const renderSortIcon = (column: keyof Task) => {
    if (sortColumn !== column) return <ChevronsUpDown size={16} className="ml-1 text-gray-400" />;
    return sortDirection === 'asc' ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />;
  };

  const columns: Array<{ key: keyof Task | 'dnd_handle' | 'checkbox' | 'actions'; label?: string; content?: JSX.Element; sortable?: boolean; className?: string }> = [
    { key: 'dnd_handle', label: '', sortable: false, className: 'w-10' },
    { 
      key: 'checkbox', 
      label: '', // No text label needed for select all checkbox header
      sortable: false, 
      className: 'w-12',
      content: ( // Content for the header cell
        <input 
          type="checkbox"
          aria-label="Select all tasks currently displayed"
          className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-offset-0 dark:focus:ring-offset-gray-800"
          checked={sortedTasks.length > 0 && sortedTasks.every(task => selectedTaskIds.includes(task.id))}
          onChange={(e) => {
            if (e.target.checked) {
              selectAllTasks(sortedTasks.map(task => task.id));
            } else {
              deselectAllTasks();
            }
          }}
        />
      )
    },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'dueDate', label: 'Due Date', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'repeat', label: 'Repeats', sortable: true }, // Added Repeats column
    { key: 'actions', label: 'Actions', sortable: false, className: 'w-20 text-right' },
  ];

  if (!storeTasks.length) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">No tasks yet. Add one above!</div>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg mt-4">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  role="columnheader"
                  aria-sort={col.sortable && sortColumn === col.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  onClick={() => col.sortable && handleHeaderClick(col.key as keyof Task)}
                  className={`px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-sm ${col.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400' : ''} ${col.className || ''}`}
                >
                  <div className="flex items-center">
                    {col.content || col.label}
                    {col.sortable && renderSortIcon(col.key as keyof Task)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <SortableContext items={storeTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedTasks.map((task) => (
                <SortableTaskRow 
                  key={task.id} 
                  task={task} 
                  onRowClick={onTaskRowClick}
                  isSelected={selectedTaskIds.includes(task.id)}
                  onToggleSelection={toggleTaskSelection}
                />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </div>
    </DndContext>
  );
};

export default TaskTable;
