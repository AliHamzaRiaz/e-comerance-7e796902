import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useProducts, type Product } from "@/hooks/useProducts";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

type OrderRow = {
  id: string;
  created_at: string;
  email: string;
  status: string;
  total: number;
};

const empty = {
  slug: "", name: "", description: "", price: 0, category: "Outerwear",
  image_url: "", tag: "", sizes: "XS,S,M,L", stock: 100, active: true,
};

export default function Admin() {
  const { data: products = [], refetch } = useProducts();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    supabase
      .from("orders")
      .select("id, created_at, email, status, total")
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as any) ?? []));
  }, []);

  const startEdit = (p: Product) => {
    setEditing(p);
    setForm({ ...p, sizes: p.sizes.join(",") });
    setShowForm(true);
  };

  const startNew = () => {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      description: form.description,
      price: Number(form.price),
      category: form.category,
      image_url: form.image_url || null,
      tag: form.tag || null,
      sizes: form.sizes.split(",").map((s: string) => s.trim()).filter(Boolean),
      stock: Number(form.stock),
      active: !!form.active,
    };
    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Created");
    setShowForm(false);
    refetch();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refetch();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container py-16">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Admin</p>
        <h1 className="font-display text-5xl mb-12">Atelier</h1>

        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-3xl">Products</h2>
          <button onClick={startNew} className="inline-flex items-center gap-2 bg-espresso text-bone py-2 px-4 text-xs uppercase tracking-[0.25em] hover:bg-ember transition-colors">
            <Plus className="h-3 w-3" /> New
          </button>
        </div>

        <div className="overflow-x-auto border border-border mb-16">
          <table className="w-full text-sm">
            <thead className="bg-cream text-xs uppercase tracking-[0.15em]">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Category</th>
                <th className="text-right p-3">Price</th>
                <th className="text-right p-3">Stock</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3 font-display">{p.name}</td>
                  <td className="p-3 text-muted-foreground">{p.category}</td>
                  <td className="p-3 text-right">${Number(p.price)}</td>
                  <td className="p-3 text-right">{p.stock}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => startEdit(p)} className="p-2 hover:text-ember"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => del(p.id)} className="p-2 hover:text-ember"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-espresso/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="bg-bone max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 space-y-4">
              <h3 className="font-display text-2xl mb-4">{editing ? "Edit product" : "New product"}</h3>
              {[
                ["slug","Slug"],["name","Name"],["description","Description"],
                ["price","Price"],["category","Category"],["image_url","Image URL"],
                ["tag","Tag"],["sizes","Sizes (comma-separated)"],["stock","Stock"],
              ].map(([k, label]) => (
                <div key={k}>
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-1">{label}</label>
                  <input
                    value={form[k] ?? ""}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="w-full border border-border p-2 bg-transparent"
                  />
                </div>
              ))}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Active
              </label>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-border py-3 text-xs uppercase tracking-[0.25em]">Cancel</button>
                <button className="flex-1 bg-espresso text-bone py-3 text-xs uppercase tracking-[0.25em]">Save</button>
              </div>
            </form>
          </div>
        )}

        <h2 className="font-display text-3xl mb-6">Orders</h2>
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead className="bg-cream text-xs uppercase tracking-[0.15em]">
              <tr>
                <th className="text-left p-3">Order</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Email</th>
                <th className="text-right p-3">Total</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No orders yet</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">#{o.id.slice(0, 8)}</td>
                  <td className="p-3">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="p-3">{o.email}</td>
                  <td className="p-3 text-right">${Number(o.total).toFixed(2)}</td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      className="bg-transparent border border-border p-1 text-xs"
                    >
                      <option>pending</option><option>paid</option><option>shipped</option><option>cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Footer />
    </div>
  );
}
