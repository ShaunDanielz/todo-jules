import type { Task } from '../types/task';

export function saveTasksAsCsv(tasks: Task[]): void {
  if (!tasks.length) {
    alert('No tasks to export.');
    return;
  }

  const headers = [
    'id',
    'title',
    'dueDate',
    'priority',
    'status',
    'notes',
    'subtasks',
    'repeat',
  ];

  const csvRows = [headers.join(',')];

  tasks.forEach((task) => {
    const row = [
      task.id,
      `"${task.title.replace(/"/g, '""')}"`, // Escape double quotes in title
      task.dueDate || '',
      task.priority,
      task.status,
      task.notes ? `"${task.notes.replace(/"/g, '""')}"` : '', // Escape double quotes in notes
      task.subtasks && task.subtasks.length > 0 ? `"${JSON.stringify(task.subtasks).replace(/"/g, '""')}"` : '', // Stringify and escape subtasks
      task.repeat || 'none',
    ];
    csvRows.push(row.join(','));
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'tasks.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // Fallback for browsers that don't support the download attribute
    alert('CSV export is not supported in this browser.');
  }
}
