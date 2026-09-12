import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";

async function main() {
  const email = process.env.EDITOR_EMAIL;
  const password = process.env.EDITOR_PASSWORD;
  if (!email || !password) {
    throw new Error("Set EDITOR_EMAIL and EDITOR_PASSWORD before seeding.");
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) {
    console.log(`Editor account ${email} already exists, skipping.`);
    return;
  }

  const passwordHash = await hash(password, 10);
  await db.insert(users).values({ email, passwordHash, role: "editor" });
  console.log(`Seeded editor account: ${email}`);
}

main();
