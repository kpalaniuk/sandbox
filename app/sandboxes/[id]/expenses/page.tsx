"use client";

import { useState, useEffect } from "react";
import { SandboxNav } from "../SandboxNav";
import { Plus, DollarSign, Check, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Expense {
  id: string;
  description: string;
  amount: number;
  payer_id: string;
  status: string;
  created_at: string;
}

export default function ExpensesPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [form, setForm] = useState({ description: "", amount: "" });

  useEffect(() => {
    // Get current user from session
    import("@/lib/supabase-browser").then(({ createSupabaseBrowserClient }) => {
      createSupabaseBrowserClient().auth.getUser().then(({ data }) =>
        setCurrentUserId(data.user?.id || null)
      );
    });
    loadExpenses();
  }, [id]);

  async function loadExpenses() {
    setLoading(true);
    const res = await fetch(`/api/sandboxes/${id}/expenses`);
    if (res.ok) setExpenses(await res.json());
    setLoading(false);
  }

  async function addExpense(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/sandboxes/${id}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: form.description, amount: form.amount }),
    });
    if (res.ok) {
      setForm({ description: "", amount: "" });
      setShowForm(false);
      loadExpenses();
    } else {
      const d = await res.json();
      alert(d.error || "Failed to add expense");
    }
    setSaving(false);
  }

  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="min-h-screen bg-sand pb-24">
      <header className="safe-top px-4 py-4 bg-cream border-b border-midnight/10 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-display font-bold">Expenses</h1>
            <p className="text-xs text-midnight/40">
              Total: <span className="font-semibold text-midnight/70">${total.toFixed(2)}</span>
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-3 py-2 bg-midnight text-cream rounded-lg text-sm font-medium hover:bg-ocean transition-colors"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {showForm && (
          <form onSubmit={addExpense} className="bg-cream rounded-2xl p-4 space-y-3">
            <h2 className="font-semibold text-sm">New Expense</h2>
            <input
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What was it? (e.g. Dinner at The Witchery)"
              required
              className="w-full px-4 py-2.5 bg-sand border-2 border-midnight/10 rounded-lg focus:border-ocean focus:outline-none text-sm"
            />
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-midnight/40">$</span>
                <input
                  type="number" step="0.01" min="0"
                  value={form.amount}
                  onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                  required
                  className="w-full pl-7 pr-4 py-2.5 bg-sand border-2 border-midnight/10 rounded-lg focus:border-ocean focus:outline-none text-sm"
                />
              </div>
              <button
                type="submit" disabled={saving}
                className="px-4 py-2.5 bg-ocean text-cream rounded-lg text-sm font-medium hover:bg-midnight transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-midnight/30" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12 text-midnight/40">
            <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No expenses yet</p>
            <p className="text-sm mt-1">Track shared costs for this trip</p>
          </div>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="bg-cream rounded-2xl p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                expense.status === "settled" ? "bg-green-100" : "bg-sunset/20"
              }`}>
                {expense.status === "settled"
                  ? <Check className="w-5 h-5 text-green-600" />
                  : <Clock className="w-5 h-5 text-sunset" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{expense.description}</p>
                <p className="text-xs text-midnight/40">
                  {format(new Date(expense.created_at), "MMM d")} ·{" "}
                  {expense.payer_id === currentUserId ? "You paid" : "Someone paid"}
                </p>
              </div>
              <p className="text-lg font-display font-semibold">${expense.amount?.toFixed(2)}</p>
            </div>
          ))
        )}
      </main>

      <SandboxNav sandboxId={id} />
    </div>
  );
}
