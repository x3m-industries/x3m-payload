'use server';

import { revalidatePath } from 'next/cache';

import configPromise from '@payload-config';

import { getPayloadWithServices } from '@x3m-industries/lib-services';

import type { TodosService } from '../collections/Todos';

export async function toggleTodo(id: string) {
  const payload = await getPayloadWithServices<{ todos: TodosService }>(configPromise);
  await payload.services.todos.toggleComplete({ id });
  revalidatePath('/');
}

export async function createTodo(formData: FormData) {
  const title = formData.get('title') as string;
  if (!title?.trim()) return;

  const payload = await getPayloadWithServices<{ todos: TodosService }>(configPromise);
  await payload.services.todos.createOne({
    data: { title: title.trim(), completed: false },
  });
  revalidatePath('/');
}

export async function deleteTodo(id: string) {
  const payload = await getPayloadWithServices<{ todos: TodosService }>(configPromise);
  await payload.services.todos.deleteOneById({ id });
  revalidatePath('/');
}
