import { useState } from "react";
import { createTodo } from "../api/todoApi";
import type { Todo, TodoInput } from "../types/todo";

type State = {
  data: Todo | null;
  loading: boolean;
  error: string | null;
};

export function useCreateTodo(token: string) {
  const [state, setState] = useState<State>({ data: null, loading: false, error: null });

  const execute = async (input: TodoInput) => {
    setState({ data: null, loading: true, error: null });
    try {
      const todo = await createTodo(input, token);
      setState({ data: todo, loading: false, error: null });
      return todo;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setState({ data: null, loading: false, error: message });
      throw err;
    }
  };

  return { ...state, execute };
}
