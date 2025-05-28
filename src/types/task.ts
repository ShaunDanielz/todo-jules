export interface Task {
  id: string;
  title: string;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  notes?: string;
  subtasks?: Array<{ id: string; text: string; completed: boolean }>;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly';
}
