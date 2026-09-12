import { auth, signOut } from "@/auth";
import { inviteWriter } from "./actions";

async function logout() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function DashboardPage() {
  const session = await auth();
  const user = session!.user;

  return (
    <main style={{ maxWidth: 480, margin: "4rem auto", fontFamily: "sans-serif" }}>
      <h1>Zinsser Filter</h1>
      <p>
        Logged in as <strong>{user.email}</strong> ({user.role})
      </p>
      <form action={logout}>
        <button type="submit">Log out</button>
      </form>

      {user.role === "editor" && (
        <section style={{ marginTop: "2rem" }}>
          <h2>Invite a Writer</h2>
          <form action={inviteWriter} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label>
              Email
              <input name="email" type="email" required style={{ display: "block", width: "100%" }} />
            </label>
            <label>
              Password
              <input name="password" type="password" required style={{ display: "block", width: "100%" }} />
            </label>
            <button type="submit">Create Writer account</button>
          </form>
        </section>
      )}
    </main>
  );
}
