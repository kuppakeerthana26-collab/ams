import express from "express";
import {
  createStudent,
  listStudents,
  listStudentsSchema,
  updateStudent,
  upsertStudentSchema,
} from "../controllers/studentController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", validate(listStudentsSchema), listStudents);
router.post("/", authorize("admin"), validate(upsertStudentSchema), createStudent);
router.put("/:id", authorize("admin"), validate(upsertStudentSchema), updateStudent);

export default router;
