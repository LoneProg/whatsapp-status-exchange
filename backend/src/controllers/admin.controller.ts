/**
 * src/controllers/admin.controller.ts
 * HTTP layer for admin-only operations.
 * All routes here require requireAdmin middleware.
 */

import { Request, Response, NextFunction } from "express";
import {
  getAllContacts,
  getContactCount,
  deleteContact,
} from "../services/contact.service";
import { generateVcf } from "../services/vcf.service";
import { AppError } from "../middleware/errorHandler";

/**
 * GET /api/admin/stats
 * Returns aggregate stats for the admin dashboard.
 */
export async function getStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const totalContacts = await getContactCount();

    res.status(200).json({
      success: true,
      data: { totalContacts },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/contacts
 * Returns the full list of contacts (paginated support optional).
 */
export async function listContacts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const contacts = await getAllContacts();

    res.status(200).json({
      success: true,
      data: { contacts, total: contacts.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/export
 * Generates and streams a vCard .vcf file of all contacts.
 */
export async function exportVcf(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const contacts = await getAllContacts();

    if (contacts.length === 0) {
      throw new AppError(404, "No contacts to export yet.");
    }

    const vcfContent = generateVcf(contacts);

    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const filename = `woodie-contacts-${timestamp}.vcf`;

    res.setHeader("Content-Type", "text/vcard; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", Buffer.byteLength(vcfContent, "utf8"));

    res.status(200).send(vcfContent);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/contacts/:id
 * Remove a single contact by ID.
 */
export async function removeContact(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError(400, "Contact ID is required.");
    }

    await deleteContact(id);

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
}
