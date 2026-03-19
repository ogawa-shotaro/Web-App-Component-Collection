import { useState } from "react";
import { deleteTodo } from "../api/todoApi";
import type { Todo } from "../types/todo";

type State = {
  data: Todo | null;
  loading: boolean;
  error: string | null;
};

export function useDeleteTodo(token: string) {
  const [state, setState] = useState<State>({ data: null, loading: false, error: null });

  const execute = async (todoId: number) => {
    setState({ data: null, loading: true, error: null });
    try {
      const todo = await deleteTodo(todoId, token);
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
