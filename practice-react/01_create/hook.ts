// ============================================================
// 練習: useCreateTodo フックを実装する
// ============================================================
// 参考: frontend-react/src/hooks/useCreateTodo.ts
// ============================================================

import { useState } from "react";
import { createTodo } from "./api";
import type { Todo, TodoInput } from "../../frontend-react/src/types/todo";

type State = {
  data: Todo | null;
  loading: boolean;
  error: string | null;
};

export function useCreateTodo(token: string) {
  // TODO: useState で state を初期化する
  //       初期値: { data: null, loading: false, error: null }

  const execute = async (input: TodoInput) => {
    // TODO: loading: true にセットする

    try {
      // TODO: createTodo(input, token) を呼び出す

      // TODO: 成功したら data に結果をセットし、loading: false にする

      // TODO: todo を return する
    } catch (err) {
      // TODO: error に message をセットし、loading: false にする

      // TODO: err を再 throw する
    }
  };

  // TODO: state と execute を return する
}
