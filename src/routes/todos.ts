import { Router } from "express";
import { authHandler } from "../middlewares/authHandler";
import { validator } from "../middlewares/validator";
import { createTodoSchema, updateTodoSchema } from "../schemas/todoSchema";
import { TodoRepository } from "../repositories/TodoRepository";
import { CreateTodoController } from "../controllers/CreateTodoController";
import { ListTodoController } from "../controllers/ListTodoController";
import { FindTodoController } from "../controllers/FindTodoController";
import { UpdateTodoController } from "../controllers/UpdateTodoController";
import { DeleteTodoController } from "../controllers/DeleteTodoController";

// ── 依存の組み立て ────────────────────────────────
const repository = new TodoRepository();

const createController = new CreateTodoController(repository);
const listController = new ListTodoController(repository);
const findController = new FindTodoController(repository);
const updateController = new UpdateTodoController(repository);
const deleteController = new DeleteTodoController(repository);

// ── ルーティング ──────────────────────────────────
export const todoRouter = Router();

// /todos
todoRouter
  .route("/")
  // GET  /todos       → 一覧取得（authのみ）
  .get(authHandler, (req, res, next) => {
    listController.execute(req, res, next);
  })
  // POST /todos       → 新規作成（auth + バリデーション）
  .post(authHandler, validator(createTodoSchema), (req, res, next) => {
    createController.execute(req, res, next);
  });

// /todos/:id
todoRouter
  .route("/:id")
  // GET    /todos/:id → 1件取得（authのみ）
  .get(authHandler, (req, res, next) => {
    findController.execute(req, res, next);
  })
  // PUT    /todos/:id → 更新（auth + バリデーション）
  .put(authHandler, validator(updateTodoSchema), (req, res, next) => {
    updateController.execute(req, res, next);
  })
  // DELETE /todos/:id → 削除（authのみ）
  .delete(authHandler, (req, res, next) => {
    deleteController.execute(req, res, next);
  });
