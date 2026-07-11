import { db } from "@/lib/db";
import { loginOrCreateAccount, loginAsDemoUser } from "@/lib/actions";

export default async function LoginPage() {
  const demoUsers = await db.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Sign in</h1>
        <p className="text-sm opacity-70">
          Prototype auth — enter any email to create or resume an account. No
          password required.
        </p>
      </div>

      <form action={loginOrCreateAccount} className="space-y-3 bg-card-bg border border-card-border rounded-xl p-5">
        <div>
          <label className="block text-sm mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-card-border bg-transparent px-3 py-2"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="name">Name (first time only)</label>
          <input
            id="name"
            name="name"
            type="text"
            className="w-full rounded-md border border-card-border bg-transparent px-3 py-2"
            placeholder="Your name"
          />
        </div>
        <button type="submit" className="w-full bg-brand text-white rounded-md py-2 font-medium hover:bg-brand-dark transition-colors">
          Continue
        </button>
      </form>

      <div>
        <p className="text-sm opacity-70 mb-2">Or jump in as a seeded demo account:</p>
        <div className="space-y-2">
          {demoUsers.map((u) => (
            <form key={u.id} action={loginAsDemoUser}>
              <input type="hidden" name="userId" value={u.id} />
              <button
                type="submit"
                className="w-full text-left border border-card-border rounded-md px-3 py-2 hover:border-brand transition-colors"
              >
                <span className="font-medium">{u.name}</span>{" "}
                <span className="opacity-60 text-sm">
                  · {u.role.toLowerCase()} · {u.email}
                </span>
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
