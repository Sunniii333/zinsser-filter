"use server";

import { hash } from "bcryptjs";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function inviteWriter(formData: FormData) {
  const session = await auth();
  if (session?.user.role !== "editor") {
    throw new Error("Only an Editor can invite Writer accounts.");
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const passwordHash = await hash(password, 10);
  await db.insert(users).values({ email, passwordHash, role: "writer" });
}
