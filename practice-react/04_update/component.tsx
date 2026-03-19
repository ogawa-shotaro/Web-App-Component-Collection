// ============================================================
// 練習: UpdateTodo コンポーネントを実装する
// ============================================================
// 参考: frontend-react/src/components/UpdateTodo.tsx
// ============================================================

import { useState } from "react";
import { useUpdateTodo } from "./hook";

type Props = {
  todoId: number;
  initialTitle?: string;
  initialBody?: string;
  token: string;
  onUpdated?: () => void;
};

export function UpdateTodo({ todoId, initialTitle = "", initialBody = "", token, onUpdated }: Props) {
  // TODO: title を useState で管理する（初期値: initialTitle）

  // TODO: body を useState で管理する（初期値: initialBody）

  // TODO: useUpdateTodo フックを呼び出す

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: execute(todoId, { title, body }) を呼ぶ

      // TODO: onUpdated?() を呼ぶ
    } catch {
      // error は state から表示するため何もしない
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>編集</h2>
      {/* TODO: title の input を作る */}
      {/* TODO: body の textarea を作る */}
      {/* TODO: error があれば赤文字で表示する */}
      {/* TODO: 送信ボタンを作る（loading 中は disabled & テキスト変更） */}
    </form>
  );
}
