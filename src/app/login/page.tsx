"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    if (result?.error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary, #111113)" }}>
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-8 rounded-lg" style={{ background: "var(--bg-secondary, #1a1a1e)", border: "1px solid var(--border, #2a2a2e)" }}>
        <h1 className="text-2xl font-bold mb-6 text-center" style={{ color: "var(--accent, #f97316)" }}>تسجيل الدخول</h1>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <div className="mb-4">
          <label className="block text-sm mb-2" style={{ color: "var(--text-secondary, #888)" }}>البريد الإلكتروني</label>
          <input name="email" type="email" required className="w-full p-3 rounded-md outline-none" style={{ background: "var(--bg-primary, #111113)", color: "var(--text-primary, #e4e4e7)", border: "1px solid var(--border, #2a2a2e)" }} />
        </div>
        <div className="mb-6">
          <label className="block text-sm mb-2" style={{ color: "var(--text-secondary, #888)" }}>كلمة المرور</label>
          <input name="password" type="password" required className="w-full p-3 rounded-md outline-none" style={{ background: "var(--bg-primary, #111113)", color: "var(--text-primary, #e4e4e7)", border: "1px solid var(--border, #2a2a2e)" }} />
        </div>
        <button type="submit" disabled={loading} className="w-full p-3 rounded-md font-bold transition-opacity disabled:opacity-50" style={{ background: "var(--accent, #f97316)", color: "var(--bg-primary, #111113)" }}>
          {loading ? "جاري التحميل..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
