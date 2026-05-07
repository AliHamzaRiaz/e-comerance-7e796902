import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Profile = {
  full_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
};

type OrderRow = {
  id: string;
  created_at: string;
  status: string;
  total: number;
  order_items: { product_name: string; quantity: number; size: string }[];
};

export default function Account() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    full_name: "", phone: "", address_line1: "", address_line2: "", city: "", postal_code: "", country: "",
  });
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setProfile(data as any);
    });
    supabase
      .from("orders")
      .select("id, created_at, status, total, order_items(product_name, quantity, size)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as any) ?? []));
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update(profile).eq("id", user.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  };

  const field = (k: keyof Profile, label: string) => (
    <div>
      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">{label}</label>
      <input
        value={profile[k] ?? ""}
        onChange={(e) => setProfile({ ...profile, [k]: e.target.value })}
        className="w-full border-b border-border py-2 bg-transparent focus:border-espresso outline-none"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Account</p>
            <h1 className="font-display text-5xl">{profile.full_name || user?.email}</h1>
          </div>
          <button onClick={signOut} className="text-xs uppercase tracking-[0.25em] underline-grow">
            Sign out
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          <form onSubmit={save} className="space-y-5">
            <h2 className="font-display text-2xl mb-4">Profile & shipping</h2>
            {field("full_name", "Full name")}
            {field("phone", "Phone")}
            {field("address_line1", "Address line 1")}
            {field("address_line2", "Address line 2")}
            <div className="grid grid-cols-2 gap-4">
              {field("city", "City")}
              {field("postal_code", "Postal code")}
            </div>
            {field("country", "Country")}
            <button
              disabled={busy}
              className="bg-espresso text-bone py-3 px-8 text-xs uppercase tracking-[0.25em] hover:bg-ember transition-colors disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </form>

          <div>
            <h2 className="font-display text-2xl mb-4">Orders</h2>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No orders yet. <Link to="/shop" className="underline-grow">Start the edit</Link>.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {orders.map((o) => (
                  <li key={o.id} className="py-5">
                    <div className="flex justify-between items-baseline">
                      <p className="font-display text-lg">#{o.id.slice(0, 8)}</p>
                      <p className="font-display">${Number(o.total).toFixed(2)}</p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">
                      {new Date(o.created_at).toLocaleDateString()} · {o.status}
                    </p>
                    <ul className="mt-3 text-sm text-foreground/70 space-y-1">
                      {o.order_items.map((it, i) => (
                        <li key={i}>
                          {it.quantity} × {it.product_name} · {it.size}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
