// ============================================================
// 練習: FindTodo コンポーネントを実装する
// ============================================================
// 参考: frontend-react/src/components/FindTodo.tsx
// ============================================================

import { useFindTodo } from "./hook";

type Props = {
  todoId: number;
  token: string;
};

export function FindTodo({ todoId, token }: Props) {
  // TODO: useFindTodo フックを呼び出して data, loading, error を取得する

  // TODO: loading 中は <p>読み込み中...</p> を return する

  // TODO: error があれば赤文字で表示して return する

  // TODO: todo が null なら null を return する

  return (
    <div>
      <h2>Todo 詳細</h2>
      {/* TODO: todo の id, title, body, createdAt を表示する */}
    </div>
  );
}
