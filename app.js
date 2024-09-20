// Initialize task array from localStorage or an empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Function to render tasks on the page
function renderTasks() {
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = ''; // Clear existing tasks

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${task.name}</span> - Due: ${new Date(task.date).toLocaleString()} 
      - Reminders: ${task.reminderText}
      <div class="task-actions">
        <button onclick="sendTestEmail(${index})">Send Test Email</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

// Function to schedule email reminders
function scheduleReminder(task) {
  const now = new Date().getTime();
  const taskTime = new Date(task.date).getTime();

  task.reminders.forEach(reminder => {
    const reminderTime = taskTime - reminder.value * 60000; // Convert reminder minutes to ms
    const delay = reminderTime - now;

    if (delay > 0) {
      setTimeout(() => {
        sendEmail(task, reminder.text);
      }, delay);
    }
  });
}

// Function to send an email reminder using EmailJS
function sendEmail(task, reminderTime) {
  const emailParams = {
    task_name: task.name,
    task_due: new Date(task.date).toLocaleString(),
    reminder_time: reminderTime
  };

  emailjs.send('service_aib9y39', 'template_qvkwpfk', emailParams)
    .then(response => {
      console.log('Email successfully sent!', response.status, response.text);
    })
    .catch(err => {
      console.error('Failed to send email:', err);
    });
}

// Function to send an instant test email
function sendTestEmail(index) {
  const task = tasks[index];
  sendEmail(task, 'Instant Reminder');
}

// Function to handle form submission
document.getElementById('task-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const taskName = document.getElementById('task-name').value;
  const taskDate = document.getElementById('task-date').value;

  // Get selected reminder times
  const reminders = [];
  const reminder24h = document.getElementById('reminder-24h');
  const reminder12h = document.getElementById('reminder-12h');
  const reminder30m = document.getElementById('reminder-30m');

  if (reminder24h.checked) reminders.push({ value: 1440, text: '24 hours' });
  if (reminder12h.checked) reminders.push({ value: 720, text: '12 hours' });
  if (reminder30m.checked) reminders.push({ value: 30, text: '30 minutes' });

  if (reminders.length === 0) {
    alert("Please select at least one reminder time.");
    return;
  }

  const reminderText = reminders.map(r => r.text).join(', ');

  const newTask = {
    name: taskName,
    date: taskDate,
    reminders: reminders,
    reminderText: reminderText
  };

  tasks.push(newTask);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  scheduleReminder(newTask); // Schedule reminder for the task
  renderTasks(); // Update UI

  // Reset form
  document.getElementById('task-form').reset();
});

// Load and display tasks from localStorage on page load
window.onload = function() {
  tasks.forEach(task => scheduleReminder(task)); // Reschedule reminders on page load
  renderTasks(); // Display saved tasks
};

