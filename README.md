# Todo App created by Jules

> **Note:** This repository is an experiment with the Google Jules product. I’m sharing my experiments publicly, but I’m not actively maintaining this code. The goal is to test the functionality of Jules and see how it performs in real-world scenarios.

## Overview

The Todo App created by Jules is a feature-rich, visually appealing todo list manager designed to help you organise your tasks effectively. It provides a modern user interface with a dark theme and ensures your tasks are always at your fingertips with browser-based local storage.

## Features

*   **Task Management:** Add, delete, and edit tasks with ease.
*   **Completion Status:** Mark tasks as complete or incomplete.
*   **Persistent Storage:** Tasks are saved in your browser's `localStorage`, so they persist across sessions.
*   **Task Filtering:** Filter tasks by "All", "Active", or "Completed" status.
*   **Due Dates:** Set and display due dates for tasks.
*   **Overdue Indication:** Visually highlights tasks that are past their due date and not yet completed.
*   **Priority Levels:** Assign "High", "Medium", or "Low" priority to tasks.
*   **Priority Sorting:** Tasks are automatically sorted by priority (High > Medium > Low) within the current filter.
*   **Drag & Drop Reordering:** Manually reorder tasks within the list using drag and drop.
*   **Search Functionality:** Quickly find tasks by searching for text content.
*   **Responsive Design:** Fully responsive layout for seamless usability on desktop, tablets, and mobile devices.
*   **Modern UI:** Features a sleek and modern dark theme.

## Technologies Used

*   **HTML5:** For the basic structure and content of the application.
*   **CSS3:** For styling the application, utilising modern features like Flexbox for layout and Media Queries for responsiveness.
*   **JavaScript (ES6+):** For all the application logic, interactivity, and DOM manipulation.
*   **SortableJS:** A third-party library (included via CDN) used to implement the drag and drop reordering functionality for tasks.

## Setup and Usage

To run the Todo App created by Jules:

1.  **Clone the repository or download the files:**
    ```bash
    # If you have git installed
    git clone <repository_url>
    cd <repository_directory>
    ```
    Alternatively, download the project files (`index.html`, `style.css`, `script.js`) into a single folder on your local machine.

2.  **Open `index.html` in your browser:**
    Navigate to the folder where you saved/cloned the files and open the `index.html` file directly in your preferred web browser (e.g., Chrome, Firefox, Safari, Edge).

No build steps or complex installations are required.

## Future Enhancements (Optional)

While the current version is packed with features, potential future enhancements could include:

*   User accounts and cloud synchronisation.
*   Customisable themes.
*   Sub-tasks or project categories.
*   Reminder notifications.
*   Advanced sorting options.
