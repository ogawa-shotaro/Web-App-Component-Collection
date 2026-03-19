import { useState, useEffect } from "react";
import { findTodo } from "../api/todoApi";
import type { Todo } from "../types/todo";

type State = {
  data: Todo | null;
  loading: boolean;
  error: string | null;
};

export function useFindTodo(todoId: number, token: string) {
  const [state, setState] = useState<State>({ data: null, loading: false, error: null });

  useEffect(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    findTodo(todoId, token)
      .then((todo) => setState({ data: todo, loading: false, error: null }))
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Unknown error";
        setState({ data: null, loading: false, error: message });
      });
  }, [todoId, token]);

  return state;
}
