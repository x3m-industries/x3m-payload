import type { Todo } from '../../payload-types';
import { todoService } from '../../services/todo-service';

export default async function Page() {
  const todos = await todoService.findMany({
    limit: 100,
  });

  return (
    <div>
      <h1>My Todos</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.docs.map((todo: Todo) => (
          <li
            key={todo.id}
            style={{
              alignItems: 'center',
              borderBottom: '1px solid #eee',
              display: 'flex',
              gap: '0.5rem',
              padding: '0.5rem',
            }}
          >
            <input
              aria-label="Todo status"
              checked={todo.completed || false}
              readOnly
              type="checkbox"
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.title}
            </span>
          </li>
        ))}
      </ul>
      {todos.docs.length === 0 && (
        <p style={{ color: '#666' }}>No todos found. Go to /admin to create some!</p>
      )}
    </div>
  );
}
