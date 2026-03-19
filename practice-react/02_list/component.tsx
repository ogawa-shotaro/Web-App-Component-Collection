// ============================================================
// 練習: TodoList コンポーネントを実装する
// ============================================================
// 参考: frontend-react/src/components/TodoList.tsx
// ============================================================

import { useListTodos } from "./hook";

type Props = {
  token: string;
  onSelect?: (id: number) => void;
};

export function TodoList({ token, onSelect }: Props) {
  // TODO: useListTodos フックを呼び出して data, loading, error, refetch を取得する

  // TODO: loading 中は <p>読み込み中...</p> を return する

  // TODO: error があれば赤文字で表示して return する

  return (
    <div>
      <h2>Todo 一覧</h2>
      {/* TODO: 再読み込みボタン（onClick で refetch を呼ぶ） */}
      {/* TODO: todos が空なら「Todoがありません」を表示する */}
      {/* TODO: todos を <ul><li> でループ表示する */}
      {/*        li の onClick で onSelect?.(todo.id) を呼ぶ */}
    </div>
  );
}
