/**
 * src/routes/admin.routes.ts
 * All routes here are protected by requireAdmin middleware.
 */

import { Router } from "express";
import { requireAdmin } from "../middleware/auth.middleware";
import {
  getStats,
  listContacts,
  exportVcf,
  removeContact,
} from "../controllers/admin.controller";

export const adminRouter = Router();

// Apply auth guard to every admin route
adminRouter.use(requireAdmin);

// GET  /api/admin/stats
adminRouter.get("/stats", getStats);

// GET  /api/admin/contacts
adminRouter.get("/contacts", listContacts);

// GET  /api/admin/export
adminRouter.get("/export", exportVcf);

// DELETE /api/admin/contacts/:id
adminRouter.delete("/contacts/:id", removeContact);
