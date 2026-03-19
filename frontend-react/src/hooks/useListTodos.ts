import { useState, useEffect, useCallback } from "react";
import { listTodos } from "../api/todoApi";
import type { Todo, TodoListParams } from "../types/todo";

type State = {
  data: Todo[];
  loading: boolean;
  error: string | null;
};

export function useListTodos(params: TodoListParams, token: string) {
  const [state, setState] = useState<State>({ data: [], loading: false, error: null });

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const todos = await listTodos(params, token);
      setState({ data: todos, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setState({ data: [], loading: false, error: message });
    }
  }, [token, params.page, params.count]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...state, refetch: fetch };
}
