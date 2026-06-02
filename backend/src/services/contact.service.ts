/**
 * src/services/contact.service.ts
 * Business logic for contact submission and retrieval.
 */

import { prisma } from "../utils/prisma";
import { normalisePhone } from "../utils/phone.utils";
import { AppError } from "../middleware/errorHandler";

export interface CreateContactDto {
  name: string;
  phone: string; // raw user input
}

export interface ContactRecord {
  id: string;
  name: string;
  phone: string;
  createdAt: Date;
}

/**
 * Validate, normalise, deduplicate, and persist a new contact.
 */
export async function createContact(
  dto: CreateContactDto,
): Promise<ContactRecord> {
  // 1. Normalise phone number to E.164
  const normalisedPhone = normalisePhone(dto.phone);
  if (!normalisedPhone) {
    throw new AppError(
      400,
      "Invalid phone number. Please include the country code (e.g. +234...).",
    );
  }

  // 2. Check for existing entry
  const existing = await prisma.contact.findUnique({
    where: { phone: normalisedPhone },
  });

  if (existing) {
    throw new AppError(409, "This phone number is already registered.");
  }

  //Add black heart emoji to all registered names before storing to database
  dto.name = dto.name.trim() + " ♠️♠️";

  // 3. Persist
  const contact = await prisma.contact.create({
    data: {
      name: dto.name.trim(),
      phone: normalisedPhone,
    },
  });

  return contact;
}

/**
 * Fetch all contacts ordered by most recent first.
 */
export async function getAllContacts(): Promise<ContactRecord[]> {
  return prisma.contact.findMany({ orderBy: { createdAt: "desc" } });
}

/**
 * Get total contact count.
 */
export async function getContactCount(): Promise<number> {
  const count = await prisma.contact.count();
  return count; 
}

/**
 * Delete a single contact by ID.
 */
export async function deleteContact(id: string): Promise<void> {
  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, "Contact not found.");
  }
  await prisma.contact.delete({ where: { id } });
}
