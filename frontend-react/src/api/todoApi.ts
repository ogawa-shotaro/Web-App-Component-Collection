import type { Todo, TodoInput, TodoListParams, TodoUpdateInput } from "../types/todo";

const BASE_URL = "http://localhost:3000";

function getHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error((error as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// POST /todos
export async function createTodo(input: TodoInput, token: string): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(input),
  });
  return handleResponse<Todo>(res);
}

// GET /todos
export async function listTodos(params: TodoListParams, token: string): Promise<Todo[]> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.count) query.set("count", String(params.count));

  const res = await fetch(`${BASE_URL}/todos?${query.toString()}`, {
    headers: getHeaders(token),
  });
  return handleResponse<Todo[]>(res);
}

// GET /todos/:id
export async function findTodo(todoId: number, token: string): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos/${todoId}`, {
    headers: getHeaders(token),
  });
  return handleResponse<Todo>(res);
}

// PUT /todos/:id
export async function updateTodo(
  todoId: number,
  input: TodoUpdateInput,
  token: string
): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos/${todoId}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(input),
  });
  return handleResponse<Todo>(res);
}

// DELETE /todos/:id
export async function deleteTodo(todoId: number, token: string): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos/${todoId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  return handleResponse<Todo>(res);
}
