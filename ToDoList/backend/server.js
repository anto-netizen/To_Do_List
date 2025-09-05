const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'todos.json');

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (you can replace with a database)
let todos = [];

// Initialize data
async function initializeData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    todos = JSON.parse(data);
    console.log('Loaded todos from file');
  } catch (error) {
    // If file doesn't exist, start with empty array
    todos = [
      { id: 1, text: 'Learn React', completed: false },
      { id: 2, text: 'Build todo app', completed: false },
      { id: 3, text: 'Deploy to production', completed: false }
    ];
    await saveData();
    console.log('Initialized with default todos');
  }
}

// Save data to file
async function saveData() {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Routes

// GET /api/todos - Get all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// POST /api/todos - Create a new todo
app.post('/api/todos', async (req, res) => {
  const { text } = req.body;
  
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'Todo text is required' });
  }
  
  const newTodo = {
    id: Date.now(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  todos.push(newTodo);
  await saveData();
  
  res.status(201).json(newTodo);
});

// PUT /api/todos/:id - Update a todo
app.put('/api/todos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { text, completed } = req.body;
  
  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  // Update the todo
  if (text !== undefined) {
    if (typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'Todo text must be a non-empty string' });
    }
    todos[todoIndex].text = text.trim();
  }
  
  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean' });
    }
    todos[todoIndex].completed = completed;
  }
  
  todos[todoIndex].updatedAt = new Date().toISOString();
  await saveData();
  
  res.json(todos[todoIndex]);
});

// DELETE /api/todos/:id - Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  const deletedTodo = todos.splice(todoIndex, 1)[0];
  await saveData();
  
  res.json({ message: 'Todo deleted successfully', todo: deletedTodo });
});

// GET /api/stats - Get todo statistics
app.get('/api/stats', (req, res) => {
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  const pending = total - completed;
  
  res.json({
    total,
    completed,
    pending,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    todosCount: todos.length 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  await initializeData();
  
  app.listen(PORT, () => {
    console.log(`Todo server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API endpoints:`);
    console.log(`  GET    /api/todos     - Get all todos`);
    console.log(`  POST   /api/todos     - Create todo`);
    console.log(`  PUT    /api/todos/:id - Update todo`);
    console.log(`  DELETE /api/todos/:id - Delete todo`);
    console.log(`  GET    /api/stats     - Get statistics`);
  });
}

startServer().catch(console.error);

module.exports = app;