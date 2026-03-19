import { useState } from "react";
import { updateTodo } from "../api/todoApi";
import type { Todo, TodoUpdateInput } from "../types/todo";

type State = {
  data: Todo | null;
  loading: boolean;
  error: string | null;
};

export function useUpdateTodo(token: string) {
  const [state, setState] = useState<State>({ data: null, loading: false, error: null });

  const execute = async (todoId: number, input: TodoUpdateInput) => {
    setState({ data: null, loading: true, error: null });
    try {
      const todo = await updateTodo(todoId, input, token);
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
