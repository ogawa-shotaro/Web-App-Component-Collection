// ============================================================
// 練習: useDeleteTodo フックを実装する
// ============================================================
// 参考: frontend-react/src/hooks/useDeleteTodo.ts
// ============================================================

import { useState } from "react";
import { deleteTodo } from "./api";
import type { Todo } from "../../frontend-react/src/types/todo";

type State = {
  data: Todo | null;
  loading: boolean;
  error: string | null;
};

export function useDeleteTodo(token: string) {
  // TODO: useState で state を初期化する

  const execute = async (todoId: number) => {
    // TODO: loading: true にセットする

    try {
      // TODO: deleteTodo(todoId, token) を呼び出す

      // TODO: 成功したら data に結果をセットし、loading: false にする

      // TODO: todo を return する
    } catch (err) {
      // TODO: error に message をセットし、loading: false にする

      // TODO: err を再 throw する
    }
  };

  // TODO: state と execute を return する
}
