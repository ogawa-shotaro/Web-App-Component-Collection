import { useDeleteTodo } from "../hooks/useDeleteTodo";

type Props = {
  todoId: number;
  token: string;
  onDeleted?: () => void;
};

export function DeleteTodo({ todoId, token, onDeleted }: Props) {
  const { loading, error, execute } = useDeleteTodo(token);

  const handleDelete = async () => {
    if (!window.confirm("削除しますか？")) return;
    try {
      await execute(todoId);
      onDeleted?.();
    } catch {
      // error は state から表示
    }
  };

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleDelete} disabled={loading} style={{ color: "red" }}>
        {loading ? "削除中..." : "削除"}
      </button>
    </div>
  );
}
