import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, X } from 'lucide-react';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);

  // Simulated API calls - replace with actual server endpoints
  const API_BASE = 'http://localhost:3001/api';

  // Fetch todos from server
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/todos`);
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
      // Fallback to local state for demo
      setTodos([
        { id: 1, text: 'Learn React', completed: false },
        { id: 2, text: 'Build todo app', completed: false },
        { id: 3, text: 'Deploy to production', completed: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Add new todo
  const addTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTodo })
      });
      
      if (response.ok) {
        const newTodoItem = await response.json();
        setTodos([...todos, newTodoItem]);
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
      // Fallback to local state
      const newTodoItem = {
        id: Date.now(),
        text: newTodo,
        completed: false
      };
      setTodos([...todos, newTodoItem]);
    }
    
    setNewTodo('');
  };

  // Toggle todo completion
  const toggleTodo = async (id) => {
    try {
      const todo = todos.find(t => t.id === id);
      const response = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      });
      
      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(todos.map(t => t.id === id ? updatedTodo : t));
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
      // Fallback to local state
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setTodos(todos.filter(todo => todo.id !== id));
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      // Fallback to local state
      setTodos(todos.filter(todo => todo.id !== id));
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Todo List</h1>
            <p className="text-gray-600">
              {completedCount} of {totalCount} tasks completed
            </p>
          </div>

          {/* Add Todo Form */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={addTodo}
              disabled={!newTodo.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Todo List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No todos yet. Add one above!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    todo.completed 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-white border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      todo.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {todo.completed && <Check size={12} />}
                  </button>
                  
                  <span
                    className={`flex-1 transition-all ${
                      todo.completed
                        ? 'text-gray-500 line-through'
                        : 'text-gray-800'
                    }`}
                  >
                    {todo.text}
                  </span>
                  
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Progress Bar */}
          {totalCount > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round((completedCount / totalCount) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}