'use client';

import { useRef } from 'react';

import { createTodo } from '../actions/todos';

export function AddTodoForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await createTodo(formData);
    formRef.current?.reset();
  }

  return (
    <div
      style={{
        background: 'white',
        padding: '0.5rem',
        borderRadius: 'var(--radius-full)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        gap: '0.5rem',
        border: '1px solid #cbd5e1',
      }}
    >
      <form
        action={handleSubmit}
        ref={formRef}
        style={{ display: 'flex', width: '100%', alignItems: 'center' }}
      >
        <div style={{ flex: 1, paddingLeft: '0.5rem' }}>
          <input
            autoComplete="off"
            className="input-glow"
            name="title"
            placeholder="What needs to be done?"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
            }}
            type="text"
          />
        </div>
        <button
          className="btn-primary"
          style={{
            height: '2.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '5rem',
            margin: '0.25rem',
          }}
          type="submit"
        >
          Add
        </button>
      </form>
    </div>
  );
}
