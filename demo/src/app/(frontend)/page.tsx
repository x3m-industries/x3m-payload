import configPromise from '@payload-config';

import { getPayloadWithServices } from '@x3m-industries/lib-services';

import type { TodosService } from '../../collections/Todos';
import { AddTodoForm } from '../../components/AddTodoForm';
import { TodoItem } from '../../components/TodoItem';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const payload = await getPayloadWithServices<{ todos: TodosService }>(configPromise);
  const todos = await payload.services.todos.findMany({ limit: 100 });

  return (
    <div className="container">
      <div style={{ margin: '3rem 0', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '3.5rem',
            marginBottom: '0.5rem',
            background: 'var(--color-brand-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1,
          }}
        >
          Focus.
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', fontWeight: 400 }}>
          Manage your tasks with clarity.
        </p>
      </div>

      <div style={{ position: 'relative', zIndex: 10, marginBottom: '2rem' }}>
        <AddTodoForm />
      </div>

      <div className="todo-card">
        <ul className="todo-list">
          {todos.docs.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
        {todos.docs.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '1rem', fontSize: '3rem', opacity: 0.2 }}>✨</p>
            <p>No tasks yet. Start by adding one above!</p>
          </div>
        )}
      </div>

      <div
        style={{
          textAlign: 'center',
          marginTop: '3rem',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        {todos.docs.filter((t) => !t.completed).length} items left
      </div>
    </div>
  );
}
