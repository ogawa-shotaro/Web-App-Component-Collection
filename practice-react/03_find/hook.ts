// ============================================================
// 練習: useFindTodo フックを実装する
// ============================================================
// 参考: frontend-react/src/hooks/useFindTodo.ts
// ============================================================

import { useState, useEffect } from "react";
import { findTodo } from "./api";
import type { Todo } from "../../frontend-react/src/types/todo";

type State = {
  data: Todo | null;
  loading: boolean;
  error: string | null;
};

export function useFindTodo(todoId: number, token: string) {
  // TODO: useState で state を初期化する

  // TODO: useEffect で todoId か token が変わるたびに findTodo を呼ぶ
  //       - フェッチ開始時に loading: true にセット
  //       - 成功: data に todo をセット
  //       - 失敗: error に message をセット
  //       - 依存配列: [todoId, token]

  // TODO: state を return する
}
