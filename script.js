// Global tasks array
let tasks = []; // This will be updated by loadTasks

// localStorage keys
const TASKS_STORAGE_KEY = 'tasks';
const THEME_STORAGE_KEY = 'themePreference'; // Added

// DOM Element References
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const priorityInput = document.getElementById('priorityInput'); 
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const filterAllBtn = document.getElementById('filterAll');
const filterActiveBtn = document.getElementById('filterActive');
const filterCompletedBtn = document.getElementById('filterCompleted');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle'); // Added
const body = document.body; // Added

// Global filter variable
let currentFilter = 'all'; // 'all', 'active', 'completed'
let currentSearchTerm = ''; 

// Placeholder functions for actions (to be implemented later) // This comment is a bit misleading now.
function toggleComplete(taskId) {
    // Find the task by its ID
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        // Toggle its completed status
        task.completed = !task.completed;
        saveTasks(); // Save after toggling
        // Re-render the entire list
        renderTasks();
    } else {
        console.error('Task not found for toggleComplete:', taskId);
    }
}

function deleteTask(taskId) {
    // Filter out the task with the given ID
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks(); // Save after deleting
    // Re-render the entire list
    renderTasks();
}

// Function to save tasks to localStorage
function saveTasks() {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

// Function to load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    if (savedTasks) {
        try {
            tasks = JSON.parse(savedTasks);
            if (!Array.isArray(tasks)) { // Ensure it's an array
                tasks = [];
            }
        } catch (e) {
            console.error("Error parsing tasks from localStorage:", e);
            tasks = []; // Reset to empty array on error
        }
    }
    // If no savedTasks, 'tasks' remains its initial empty array.
}

// Function to switch a task item to edit mode
function editTask(taskId) {
    const taskItem = document.querySelector(`li[data-id='${taskId}']`);
    if (!taskItem) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Store the original checkbox and its state
    const originalCheckbox = taskItem.querySelector('input[type="checkbox"]').cloneNode(true);
    originalCheckbox.addEventListener('change', () => toggleComplete(task.id));

    // Clear current content of taskItem
    taskItem.innerHTML = ''; 
    taskItem.appendChild(originalCheckbox); // Add checkbox back first

    // Create text input field for task text
    const editTextInput = document.createElement('input');
    editTextInput.type = 'text';
    editTextInput.value = task.text;
    editTextInput.classList.add('edit-input'); // For potential styling
    taskItem.appendChild(editTextInput);
    editTextInput.focus(); // Focus the input field

    // Create date input field for due date
    const editDueDateInput = document.createElement('input');
    editDueDateInput.type = 'date';
    editDueDateInput.value = task.dueDate || '';
    editDueDateInput.classList.add('edit-due-date-input');
    taskItem.appendChild(editDueDateInput);

    // Create priority select field
    const editPriorityInput = document.createElement('select');
    editPriorityInput.classList.add('edit-priority-input');
    ['low', 'medium', 'high'].forEach(pLevel => {
        const option = document.createElement('option');
        option.value = pLevel;
        option.textContent = pLevel.charAt(0).toUpperCase() + pLevel.slice(1);
        if (pLevel === (task.priority || 'medium')) { // Default to medium if no priority
            option.selected = true;
        }
        editPriorityInput.appendChild(option);
    });
    taskItem.appendChild(editPriorityInput);

    // Create Save button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.classList.add('save-btn');
    saveBtn.addEventListener('click', () => saveEditedTask(taskId, editTextInput.value, editDueDateInput.value, editPriorityInput.value));

    // Create Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.classList.add('cancel-btn'); // For styling
    cancelBtn.addEventListener('click', () => renderTasks()); // Re-render to cancel

    const editActionsDiv = document.createElement('div');
    editActionsDiv.classList.add('actions');
    editActionsDiv.appendChild(saveBtn);
    editActionsDiv.appendChild(cancelBtn);
    taskItem.appendChild(editActionsDiv);

    // Ensure the task item still reflects completion status
    if (task.completed) {
        taskItem.classList.add('completed');
    } else {
        taskItem.classList.remove('completed');
    }
     // If checkbox was checked, ensure its visual state is maintained
    if (originalCheckbox.checked) {
        taskItem.querySelector('input[type="checkbox"]').checked = true;
    }
}

// Function to save the edited task
function saveEditedTask(taskId, newText, newDueDate, newPriority) {
    const textToSave = newText.trim();
    const task = tasks.find(t => t.id === taskId);

    if (task) {
        // Allow task text to be set to empty
        task.text = textToSave; 
        task.dueDate = newDueDate || null; 
        task.priority = newPriority || 'medium'; // Default to medium if somehow null
        saveTasks();
    }
    renderTasks(); // Re-render to show updated task and exit edit mode
}


// renderTasks function
function renderTasks() {
    // Clear any existing items in taskList
    taskList.innerHTML = '';

    // Start with all tasks
    let tasksToDisplay = tasks;

    // 1. Apply status filter (all, active, completed)
    if (currentFilter === 'active') {
        tasksToDisplay = tasksToDisplay.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        tasksToDisplay = tasksToDisplay.filter(task => task.completed);
    }
    // 'all' shows all, so no change needed here for status filter

    // 2. Apply search filter
    if (currentSearchTerm) { // Only filter if searchTerm is not empty
        tasksToDisplay = tasksToDisplay.filter(task => 
            task.text.toLowerCase().includes(currentSearchTerm)
        );
    }

    // 3. Apply sorting (e.g., by priority)
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    tasksToDisplay.sort((a, b) => {
        const priorityA = priorityOrder[a.priority || 'medium'];
        const priorityB = priorityOrder[b.priority || 'medium'];
        return priorityA - priorityB;
    });

    // Then loop through 'tasksToDisplay' to generate the HTML
    tasksToDisplay.forEach(task => {
        // Create an <li> element
        const li = document.createElement('li');
        li.classList.add('task-item');
        li.classList.add(`priority-${task.priority || 'medium'}`); // Add priority class
        li.setAttribute('data-id', task.id);

        // Create a checkbox (<input type="checkbox">)
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleComplete(task.id));
        li.appendChild(checkbox); // Append checkbox

        // Create a <span> to display the task's text
        const span = document.createElement('span');
        span.textContent = task.text;
        span.classList.add('task-text'); // Add class for potential specific styling
        li.appendChild(span); // Append span

        // Display Due Date
        if (task.dueDate) {
            const dueDateSpan = document.createElement('span');
            dueDateSpan.classList.add('due-date');
            // Basic formatting, could be enhanced
            const date = new Date(task.dueDate);
            // The userTimezoneOffset is used to counteract the toLocaleDateString() method's tendency
            // to shift dates based on the user's local timezone, ensuring the displayed date
            // matches the input date regardless of timezone.
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            dueDateSpan.textContent = `Due: ${new Date(date.getTime() + userTimezoneOffset).toLocaleDateString()}`;
            li.appendChild(dueDateSpan);

            // Check for overdue
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize today's date
            // The date from input is YYYY-MM-DD, which JS parses as UTC.
            // To compare correctly with local 'today', convert task.dueDate to local date parts.
            const [year, month, day] = task.dueDate.split('-').map(Number);
            const taskDate = new Date(year, month - 1, day); // Month is 0-indexed

            if (taskDate < today && !task.completed) {
                li.classList.add('overdue');
            }
        }

        // Create an Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn'); 
        editBtn.addEventListener('click', (e) => {
            // Prevent edit if task is completed
            if (task.completed) {
                e.preventDefault(); // Stop the event
                // Optionally, provide feedback to the user
                // alert("Completed tasks cannot be edited. Please uncheck first.");
                return;
            }
            editTask(task.id);
        });

        // Create a delete button (<button>)
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn'); 
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        // Actions container
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');
        actionsDiv.appendChild(editBtn); 
        actionsDiv.appendChild(deleteBtn);
        li.appendChild(actionsDiv);

        // If the task is completed, add a class like completed to the <li>
        if (task.completed) {
            li.classList.add('completed');
            li.classList.remove('overdue'); // Remove overdue if completed
        }

        // Append the <li> to the taskList UL
        taskList.appendChild(li);
    });
}

// addTask function
function addTask() {
    const taskText = taskInput.value.trim();
    const dueDateValue = dueDateInput.value;
    const priorityValue = priorityInput.value; // Get priority

    if (taskText !== '') {
        // Create a new task object
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            dueDate: dueDateValue || null,
            priority: priorityValue || 'medium' // Store priority, default to medium
        };

        // Add this new task object to the tasks array
        tasks.push(newTask);
        saveTasks(); // Save after adding

        // Call renderTasks() to update the UI
        renderTasks();

        // Clear the input fields
        taskInput.value = '';
        dueDateInput.value = '';
        priorityInput.value = 'medium'; // Reset priority to medium

        // Optionally, set focus back to taskInput
        taskInput.focus();
    }
}

// Event Listener for Add Task Button
addTaskBtn.addEventListener('click', addTask);

// Event Listener for 'Enter' key in taskInput
taskInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Initial render (optional, useful for seeing empty state or pre-filled tasks)
// Example: Add a few sample tasks for testing (can be removed later)
/*
tasks.push({ id: Date.now() + 1, text: 'Learn HTML', completed: true });
tasks.push({ id: Date.now() + 2, text: 'Learn CSS', completed: false });
tasks.push({ id: Date.now() + 3, text: 'Learn JavaScript', completed: false });
*/

// Initial setup when the script loads
document.addEventListener('DOMContentLoaded', () => {
    // Load and apply saved theme first
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('dark'); // Default to dark theme if no preference saved
    }

    loadTasks(); // Load tasks from localStorage
    renderTasks(); // Display the loaded tasks
    updateFilterButtonsUI(); // Set initial active state for 'All' button

    // Event Listener for Search Input
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentSearchTerm = searchInput.value.toLowerCase().trim();
            renderTasks();
        });
    }

    // Initialize SortableJS
    if (taskList && typeof Sortable !== 'undefined') {
        new Sortable(taskList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: function (evt) {
                const itemEl = evt.item; // Dragged HTMLElement
                
                // Get the new order of task IDs from the DOM, considering only currently displayed tasks
                const displayedTaskIds = Array.from(taskList.children).map(li => parseInt(li.dataset.id));

                // Create a new tasks array:
                // 1. Start with tasks that were reordered (visible in the list during the drag)
                let newTasksArray = displayedTaskIds.map(id => tasks.find(t => t.id === id)).filter(t => t); 

                // 2. Add tasks that were NOT visible (due to filtering/search) 
                // This ensures that tasks not part of the visible drag operation are preserved in their relative order.
                tasks.forEach(originalTask => {
                    if (!newTasksArray.find(t => t.id === originalTask.id)) {
                        newTasksArray.push(originalTask);
                    }
                });
                
                tasks = newTasksArray; // Update the global tasks array with the new, complete order

                saveTasks(); // Save the new order
                renderTasks(); // Re-render to ensure UI consistency, especially if filters/sorting apply.
            }
        });
    } else {
        console.error("SortableJS not found or taskList element is missing.");
    }
});

// Function to set the current filter
function setFilter(filterType) {
    currentFilter = filterType;
    updateFilterButtonsUI();
    renderTasks();
}

// Function to update filter buttons' UI
function updateFilterButtonsUI() {
    if (filterAllBtn) filterAllBtn.classList.remove('active');
    if (filterActiveBtn) filterActiveBtn.classList.remove('active');
    if (filterCompletedBtn) filterCompletedBtn.classList.remove('active');

    switch (currentFilter) {
        case 'all':
            if (filterAllBtn) filterAllBtn.classList.add('active');
            break;
        case 'active':
            if (filterActiveBtn) filterActiveBtn.classList.add('active');
            break;
        case 'completed':
            if (filterCompletedBtn) filterCompletedBtn.classList.add('active');
            break;
    }
}

// Add Event Listeners to Filter Buttons
if (filterAllBtn) filterAllBtn.addEventListener('click', () => setFilter('all'));
if (filterActiveBtn) filterActiveBtn.addEventListener('click', () => setFilter('active'));
if (filterCompletedBtn) filterCompletedBtn.addEventListener('click', () => setFilter('completed'));

// --- Theme Switching Logic ---
function applyTheme(theme) {
    if (theme === 'light') {
        body.classList.add('light-mode');
        if (themeToggle) themeToggle.checked = true;
    } else { // 'dark' or any other case
        body.classList.remove('light-mode');
        if (themeToggle) themeToggle.checked = false;
    }
}

function saveThemePreference(theme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
}

if (themeToggle) {
    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'light' : 'dark';
        applyTheme(newTheme);
        saveThemePreference(newTheme);
    });
}
// --- End Theme Switching Logic ---
