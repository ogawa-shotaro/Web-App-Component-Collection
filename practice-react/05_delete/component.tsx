// ============================================================
// 練習: DeleteTodo コンポーネントを実装する
// ============================================================
// 参考: frontend-react/src/components/DeleteTodo.tsx
// ============================================================

import { useDeleteTodo } from "./hook";

type Props = {
  todoId: number;
  token: string;
  onDeleted?: () => void;
};

export function DeleteTodo({ todoId, token, onDeleted }: Props) {
  // TODO: useDeleteTodo フックを呼び出して loading, error, execute を取得する

  const handleDelete = async () => {
    // TODO: window.confirm() で確認する
    //       キャンセルされたら return する

    try {
      // TODO: execute(todoId) を呼ぶ

      // TODO: onDeleted?() を呼ぶ
    } catch {
      // error は state から表示するため何もしない
    }
  };

  return (
    <div>
      {/* TODO: error があれば赤文字で表示する */}
      {/* TODO: 削除ボタンを作る */}
      {/*        - onClick: handleDelete */}
      {/*        - disabled: loading 中 */}
      {/*        - style: 赤文字 */}
      {/*        - テキスト: loading 中は「削除中...」、それ以外は「削除」 */}
    </div>
  );
}
