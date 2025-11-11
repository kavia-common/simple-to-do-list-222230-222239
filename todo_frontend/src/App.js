import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import './App.css';
import './index.css';

/**
 * Ocean Professional Theme Tokens (kept in JS for easy reference)
 * primary: #2563EB (blue-600)
 * secondary/success: #F59E0B (amber-500)
 * error: #EF4444 (red-500)
 * background: #f9fafb
 * surface: #ffffff
 * text: #111827
 */

// Simple unique id generator for tasks
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// PUBLIC_INTERFACE
export default function App() {
  /**
   * App is the main component managing tasks state and rendering the UI.
   * - Adds tasks
   * - Lists tasks
   * - Toggles completion
   * - Deletes tasks
   * Tasks are persisted to localStorage.
   */
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem('tasks');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Optional theme preference via prefers-color-scheme, but keep app bright and oceanic by default
  const [preferredDark] = useState(
    () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch {
      // ignore storage errors
    }
  }, [tasks]);

  useEffect(() => {
    document.title = 'Ocean To‑Do';
  }, []);

  // Accessible handlers
  const addTask = useCallback((text) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return;
    setTasks((prev) => [{ id: uid(), text: trimmed, completed: false }, ...prev]);
  }, []);

  const toggleTask = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const remainingCount = useMemo(() => tasks.filter((t) => !t.completed).length, [tasks]);

  return (
    <div className={`ocean-app ${preferredDark ? 'prefers-dark' : ''}`}>
      <GradientBackground />
      <main className="container" role="main" aria-labelledby="app-title">
        <header className="header">
          <h1 id="app-title" className="title" aria-live="polite">
            Ocean To‑Do
          </h1>
          <p className="subtitle">Stay organized with a clean, modern list.</p>
        </header>

        <TaskInput onAdd={addTask} />

        <section className="card" aria-label="Task list">
          {tasks.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
              <footer className="list-footer" aria-live="polite">
                {remainingCount === 0 ? 'All tasks completed. Great job!' : `${remainingCount} task${remainingCount > 1 ? 's' : ''} remaining`}
              </footer>
            </>
          )}
        </section>

        <FooterNote />
      </main>
    </div>
  );
}

function GradientBackground() {
  return <div className="ocean-gradient" aria-hidden="true" />;
}

function FooterNote() {
  return (
    <p className="footnote">
      Frontend only. Data stored locally in your browser.
    </p>
  );
}

function EmptyState() {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <span className="empty-emoji" aria-hidden="true">🌊</span>
      <p className="empty-text">Your list is clear. Add a task to get started.</p>
    </div>
  );
}

function TaskInput({ onAdd }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const submit = useCallback(() => {
    onAdd(value);
    setValue('');
    // return focus to input for fast entry
    inputRef.current?.focus();
  }, [onAdd, value]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="card input-card">
      <label htmlFor="task-input" className="sr-only">Add a new task</label>
      <div className="input-row">
        <input
          ref={inputRef}
          id="task-input"
          className="text-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Add a new task..."
          aria-label="Task description"
        />
        <button
          type="button"
          className="btn add-btn"
          onClick={submit}
          aria-label="Add task"
          disabled={!value.trim()}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function TaskList({ tasks, onToggle, onDelete }) {
  return (
    <ul className="task-list" role="list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}

function TaskItem({ task, onToggle, onDelete }) {
  const { id, text, completed } = task;
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle(id);
    }
  };

  return (
    <li className="task-item">
      <div className="left">
        <input
          id={`cb-${id}`}
          type="checkbox"
          checked={completed}
          onChange={() => onToggle(id)}
          aria-checked={completed}
          aria-label={`Mark "${text}" as ${completed ? 'incomplete' : 'complete'}`}
        />
        <label
          htmlFor={`cb-${id}`}
          className={`task-text ${completed ? 'completed' : ''}`}
          tabIndex={0}
          onKeyDown={onKeyDown}
          aria-describedby={`status-${id}`}
        >
          {text}
        </label>
        <span id={`status-${id}`} className="sr-only">
          {completed ? 'Completed' : 'Active'}
        </span>
      </div>
      <div className="right">
        <button
          type="button"
          className="icon-btn delete-btn"
          onClick={() => onDelete(id)}
          aria-label={`Delete task "${text}"`}
          title="Delete"
        >
          ✕
        </button>
      </div>
    </li>
  );
}
