'use server';

import { revalidatePath } from 'next/cache';

import { getPayload } from '../services';

export async function toggleTodo(id: string) {
  const payload = await getPayload();
  await payload.services.todos.toggleComplete({ id });
  revalidatePath('/');
}

export async function createTodo(formData: FormData) {
  const title = formData.get('title') as string;
  if (!title?.trim()) return;

  const payload = await getPayload();
  await payload.services.todos.createOne({
    data: { title: title.trim(), completed: false },
  });
  revalidatePath('/');
}

export async function deleteTodo(id: string) {
  const payload = await getPayload();
  await payload.services.todos.deleteOneById({ id });
  revalidatePath('/');
}
