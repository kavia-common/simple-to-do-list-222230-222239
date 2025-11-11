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
   * - Filters tasks
   * - Inline edit
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

  // filter: 'all' | 'active' | 'completed'
  const [filter, setFilter] = useState('all');

  // announcements for screen readers
  const liveRef = useRef(null);
  const announce = useCallback((msg) => {
    // Update aria-live region text content to announce changes
    if (liveRef.current) {
      liveRef.current.textContent = msg;
    }
  }, []);

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
    if (!trimmed) {
      announce('Cannot add an empty task');
      return;
    }
    setTasks((prev) => {
      const next = [{ id: uid(), text: trimmed, completed: false }, ...prev];
      return next;
    });
    announce(`Added task: ${trimmed}`);
  }, [announce]);

  const toggleTask = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => {
      const task = prev.find(t => t.id === id);
      const next = prev.filter((t) => t.id !== id);
      // announce after removal for correctness
      announce(`Deleted task${task?.text ? `: ${task.text}` : ''}`);
      return next;
    });
  }, [announce]);

  const editTask = useCallback((id, newText) => {
    const trimmed = (newText || '').trim();
    if (!trimmed) {
      announce('Edit cancelled. Empty value not saved.');
      return; // do not commit empty edits
    }
    setTasks((prev) => {
      const prevTask = prev.find(t => t.id === id);
      const next = prev.map((t) => (t.id === id ? { ...t, text: trimmed } : t));
      if (prevTask && prevTask.text !== trimmed) {
        announce(`Edited task: ${trimmed}`);
      }
      return next;
    });
  }, [announce]);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => {
      const removed = prev.filter((t) => t.completed).length;
      const next = prev.filter((t) => !t.completed);
      announce(removed > 0 ? `Cleared ${removed} completed task${removed > 1 ? 's' : ''}` : 'No completed tasks to clear');
      return next;
    });
  }, [announce]);

  const remainingCount = useMemo(() => tasks.filter((t) => !t.completed).length, [tasks]);
  const completedCount = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);

  const filteredTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter((t) => !t.completed);
    if (filter === 'completed') return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  const onSetFilter = useCallback((val) => setFilter(val), []);

  // Per-filter empty messages
  const emptyMessages = {
    all: 'Your list is clear. Add a task to get started.',
    active: 'No active tasks. Enjoy the calm seas!',
    completed: 'No completed tasks yet. Mark tasks as done to see them here.'
  };

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

        {/* aria-live polite region for announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRef} />

        <TaskInput onAdd={addTask} />

        <Filters
          filter={filter}
          setFilter={onSetFilter}
          remaining={remainingCount}
          completed={completedCount}
          onClearCompleted={clearCompleted}
        />

        <section className="card" aria-label="Task list">
          {filteredTasks.length === 0 ? (
            <EmptyState message={emptyMessages[filter]} />
          ) : (
            <>
              <TaskList
                tasks={filteredTasks}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onEdit={editTask}
              />
              <footer className="list-footer" aria-live="polite">
                {remainingCount === 0
                  ? 'All tasks completed. Great job!'
                  : `${remainingCount} task${remainingCount > 1 ? 's' : ''} remaining`}
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

function EmptyState({ message = 'Your list is clear. Add a task to get started.' }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <span className="empty-emoji" aria-hidden="true">🌊</span>
      <p className="empty-text">{message}</p>
    </div>
  );
}

function TaskInput({ onAdd }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const submit = useCallback(() => {
    const text = (value || '').trim();
    onAdd(text);
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

function Filters({ filter, setFilter, remaining, completed, onClearCompleted }) {
  const buttons = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="card filters-card" role="region" aria-label="Filters">
      <div className="filters-row">
        <div className="btn-group" role="group" aria-label="Filter tasks">
          {buttons.map((b) => (
            <button
              key={b.id}
              type="button"
              className={`filter-btn ${filter === b.id ? 'selected' : ''}`}
              aria-pressed={filter === b.id}
              onClick={() => setFilter(b.id)}
              aria-label={`Show ${b.label.toLowerCase()} tasks`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <div className="filters-meta">
          <span aria-live="polite" className="remaining-label">
            {remaining} left
          </span>
          {completed > 0 && (
            <button
              type="button"
              className="clear-btn"
              onClick={onClearCompleted}
              aria-label="Clear completed tasks"
            >
              Clear completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskList({ tasks, onToggle, onDelete, onEdit }) {
  return (
    <ul className="task-list" role="list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}

const TaskItem = React.memo(function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const { id, text, completed } = task;
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const editInputRef = useRef(null);
  const editButtonRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      // focus the input when entering edit mode
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    // keep draft in sync if text changes externally
    setDraft(text);
  }, [text]);

  const enterEdit = useCallback(() => setIsEditing(true), []);
  const exitEdit = useCallback(() => setIsEditing(false), []);

  const commitEdit = useCallback(() => {
    const trimmed = (draft || '').trim();
    if (!trimmed) {
      // do not commit empty changes, just exit and keep original
      setDraft(text);
      exitEdit();
      // return focus to edit button if available
      editButtonRef.current?.focus();
      return;
    }
    if (trimmed !== text) {
      onEdit(id, trimmed);
    }
    exitEdit();
    editButtonRef.current?.focus();
  }, [draft, text, onEdit, id, exitEdit]);

  const cancelEdit = useCallback(() => {
    setDraft(text);
    exitEdit();
    editButtonRef.current?.focus();
  }, [text, exitEdit]);

  const onLabelKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle(id);
    }
  };

  const onEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
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
        {!isEditing ? (
          <label
            htmlFor={`cb-${id}`}
            className={`task-text ${completed ? 'completed' : ''}`}
            tabIndex={0}
            onKeyDown={onLabelKeyDown}
            aria-describedby={`status-${id}`}
            onClick={enterEdit}
            title="Click to edit"
          >
            {text}
          </label>
        ) : (
          <input
            ref={editInputRef}
            className="edit-input"
            aria-label="Edit task"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onEditKeyDown}
            onBlur={commitEdit}
          />
        )}
        <span id={`status-${id}`} className="sr-only">
          {completed ? 'Completed' : 'Active'}
        </span>
      </div>
      <div className="right">
        {!isEditing && (
          <button
            ref={editButtonRef}
            type="button"
            className="icon-btn"
            onClick={enterEdit}
            aria-label={`Edit task "${text}"`}
            title="Edit"
          >
            ✎
          </button>
        )}
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
});
