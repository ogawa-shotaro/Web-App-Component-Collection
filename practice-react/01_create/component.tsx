// ============================================================
// 練習: CreateTodo コンポーネントを実装する
// ============================================================
// 参考: frontend-react/src/components/CreateTodo.tsx
// ============================================================

import { useState } from "react";
import { useCreateTodo } from "./hook";

type Props = {
  token: string;
  onCreated?: () => void;
};

export function CreateTodo({ token, onCreated }: Props) {
  // TODO: title, body を useState で管理する

  // TODO: useCreateTodo フックを呼び出して loading, error, execute を取得する

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: execute({ title, body }) を呼ぶ

      // TODO: フォームをリセットする（title, body を空にする）

      // TODO: onCreated?() を呼ぶ
    } catch {
      // error は state から表示するため何もしない
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>新規作成</h2>
      {/* TODO: title の input を作る */}
      {/* TODO: body の textarea を作る */}
      {/* TODO: error があれば赤文字で表示する */}
      {/* TODO: 送信ボタンを作る（loading 中は disabled & テキスト変更） */}
    </form>
  );
}
