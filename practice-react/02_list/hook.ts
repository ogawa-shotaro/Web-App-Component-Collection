// ============================================================
// 練習: useListTodos フックを実装する
// ============================================================
// 参考: frontend-react/src/hooks/useListTodos.ts
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { listTodos } from "./api";
import type { Todo, TodoListParams } from "../../frontend-react/src/types/todo";

type State = {
  data: Todo[];
  loading: boolean;
  error: string | null;
};

export function useListTodos(params: TodoListParams, token: string) {
  // TODO: useState で state を初期化する
  //       初期値: { data: [], loading: false, error: null }

  // TODO: useCallback で fetch 関数を作る
  //       - loading: true にセット
  //       - listTodos(params, token) を呼び出す
  //       - 成功: data に結果をセット
  //       - 失敗: error に message をセット
  //       - 依存配列: [token, params.page, params.count]

  // TODO: useEffect でマウント時に fetch を呼ぶ
  //       依存配列: [fetch]

  // TODO: state と refetch（= fetch 関数）を return する
}
