import { useState } from "react";
import { useCreateTodo } from "../hooks/useCreateTodo";

type Props = {
  token: string;
  onCreated?: () => void;
};

export function CreateTodo({ token, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { loading, error, execute } = useCreateTodo(token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await execute({ title, body });
      setTitle("");
      setBody("");
      onCreated?.();
    } catch {
      // error は state から表示
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>新規作成</h2>
      <div>
        <label>タイトル</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label>本文</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} required />
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "送信中..." : "作成"}
      </button>
    </form>
  );
}
