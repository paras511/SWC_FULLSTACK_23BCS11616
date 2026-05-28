import { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import TaskItem from './components/TaskItem';
import { loadTasks, saveTasks } from './utils/storage';

export default function App() {
  const [tasks, setTasks] = useState(() => loadTasks());
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const addTask = useCallback(() => {
    const text = inputValue.trim();

    if (!text) {
      setError('Please enter a task');
      return;
    }

    // Check for duplicates
    const isDuplicate = tasks.some(
      (t) => t.text.toLowerCase() === text.toLowerCase()
    );
    if (isDuplicate) {
      setError('This task already exists');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      text,
      completed: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    setInputValue('');
    setError('');
    inputRef.current?.focus();
  }, [inputValue, tasks]);

  const toggleTask = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const editTask = useCallback((id, newText) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: newText } : t))
    );
  }, []);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const activeCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>Todo App</h1>
        <p>Keep track of your daily tasks</p>
      </header>

      {/* Input */}
      <div className="input-section">
        <input
          ref={inputRef}
          type="text"
          className="task-input"
          placeholder="What needs to be done?"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (error) setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          autoFocus
        />
        <button
          className="add-btn"
          onClick={addTask}
          disabled={inputValue.trim().length === 0}
        >
          Add
        </button>
      </div>
      {error && <div className="input-error">{error}</div>}

      {/* Filters + Count */}
      {tasks.length > 0 && (
        <div className="controls-section">
          <div className="filter-group">
            {['all', 'active', 'completed'].map((f) => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <span className="task-count">
            {activeCount} task{activeCount !== 1 ? 's' : ''} remaining
          </span>
        </div>
      )}

      {/* Task List */}
      <div className="task-list">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEdit={editTask}
            />
          ))
        ) : (
          <div className="empty-state">
            <h2 className="empty-state-title">
              {filter === 'all' ? 'No tasks yet' : filter === 'active' ? 'All done!' : 'Nothing completed'}
            </h2>
            <p className="empty-state-text">
              {filter === 'all'
                ? 'Add your first task above'
                : filter === 'active'
                ? 'No active tasks right now'
                : 'Complete a task and it will show here'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <p>Press Enter to add • Double-click a task to edit</p>
      </footer>
    </div>
  );
}
