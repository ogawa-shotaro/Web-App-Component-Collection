// ============================================================
// 練習: useUpdateTodo フックを実装する
// ============================================================
// 参考: frontend-react/src/hooks/useUpdateTodo.ts
// ============================================================

import { useState } from "react";
import { updateTodo } from "./api";
import type { Todo, TodoUpdateInput } from "../../frontend-react/src/types/todo";

type State = {
  data: Todo | null;
  loading: boolean;
  error: string | null;
};

export function useUpdateTodo(token: string) {
  // TODO: useState で state を初期化する

  const execute = async (todoId: number, input: TodoUpdateInput) => {
    // TODO: loading: true にセットする

    try {
      // TODO: updateTodo(todoId, input, token) を呼び出す

      // TODO: 成功したら data に結果をセットし、loading: false にする

      // TODO: todo を return する
    } catch (err) {
      // TODO: error に message をセットし、loading: false にする

      // TODO: err を再 throw する
    }
  };

  // TODO: state と execute を return する
}
