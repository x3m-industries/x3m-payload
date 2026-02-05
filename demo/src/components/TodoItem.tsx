'use client';

import type { Todo } from '@payload-types';

import { deleteTodo, toggleTodo } from '../actions/todos';

export function TodoItem({ todo }: { todo: Todo }) {
  return (
    <li
      className="animate-slide-in"
      style={{
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
        transition: 'background-color 0.2s',
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)')}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <input
        aria-label="Toggle todo"
        className="custom-checkbox"
        checked={todo.completed || false}
        onChange={() => toggleTodo(todo.id)}
        type="checkbox"
      />
      <span
        style={{
          flex: 1,
          textDecoration: todo.completed ? 'line-through' : 'none',
          color: todo.completed ? 'var(--text-muted)' : 'var(--text-primary)',
          transition: 'all 0.2s',
          fontSize: '1.05rem',
          fontWeight: 500,
        }}
      >
        {todo.title}
      </span>
      <button
        aria-label="Delete todo"
        onClick={() => deleteTodo(todo.id)}
        style={{
          opacity: 0.4,
          padding: '0.4rem',
          borderRadius: 'var(--radius-full)',
          transition: 'all 0.2s',
          color: 'var(--text-secondary)',
          display: 'flex',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.backgroundColor = '#fecaca';
          e.currentTarget.style.color = '#dc2626';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.opacity = '0.4';
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 18 18" />
        </svg>
      </button>
    </li>
  );
}
