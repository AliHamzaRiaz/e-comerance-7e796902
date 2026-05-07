import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  full_name: z.string().trim().min(1).max(100),
  address_line1: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(100),
  postal_code: z.string().trim().min(1).max(20),
  country: z.string().trim().min(1).max(100),
});

export default function Checkout() {
  const { state, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: "", address_line1: "", address_line2: "",
    city: "", postal_code: "", country: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setForm({
          full_name: data.full_name ?? "",
          address_line1: data.address_line1 ?? "",
          address_line2: data.address_line2 ?? "",
          city: data.city ?? "",
          postal_code: data.postal_code ?? "",
          country: data.country ?? "",
        });
      }
    });
  }, [user]);

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="container py-32 text-center">
          <h1 className="font-display text-4xl mb-4">Your bag is empty</h1>
          <button onClick={() => navigate("/shop")} className="underline-grow text-xs uppercase tracking-[0.25em]">
            Discover the edit
          </button>
        </section>
        <Footer />
      </div>
    );
  }

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to checkout");
      navigate("/auth");
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          email: user.email!,
          total: subtotal,
          status: "paid", // demo — real Stripe webhook would set this
          shipping_address: form,
        })
        .select("id")
        .single();
      if (error) throw error;

      const items = state.items.map((i) => ({
        order_id: order.id,
        product_id: i.product.id,
        product_name: i.product.name,
        product_image: i.product.image_url,
        size: i.size,
        quantity: i.quantity,
        unit_price: i.product.price,
      }));
      const { error: e2 } = await supabase.from("order_items").insert(items);
      if (e2) throw e2;

      await clear();
      toast.success("Order placed");
      navigate("/account");
    } catch (err: any) {
      toast.error(err.message || "Checkout failed");
    } finally {
      setBusy(false);
    }
  };

  const f = (k: keyof typeof form, label: string, required = true) => (
    <div>
      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">{label}</label>
      <input
        value={form[k]}
        onChange={(e) => setForm({ ...form, [k]: e.target.value })}
        required={required}
        className="w-full border-b border-border py-2 bg-transparent focus:border-espresso outline-none"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container py-16">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Checkout</p>
        <h1 className="font-display text-5xl mb-12">Almost yours</h1>

        <div className="grid md:grid-cols-[1fr_400px] gap-16">
          <form onSubmit={placeOrder} className="space-y-5">
            <h2 className="font-display text-2xl mb-2">Shipping</h2>
            {f("full_name", "Full name")}
            {f("address_line1", "Address line 1")}
            {f("address_line2", "Address line 2", false)}
            <div className="grid grid-cols-2 gap-4">
              {f("city", "City")}
              {f("postal_code", "Postal code")}
            </div>
            {f("country", "Country")}

            <p className="text-xs text-muted-foreground pt-4">
              Demo checkout — no payment is processed. Connect Stripe in settings to enable real payments.
            </p>

            <button
              disabled={busy}
              className="w-full bg-espresso text-bone py-5 text-xs uppercase tracking-[0.25em] hover:bg-ember transition-colors duration-500 disabled:opacity-50"
            >
              {busy ? "Placing…" : `Place order — $${subtotal.toFixed(2)}`}
            </button>
          </form>

          <aside className="bg-cream p-8 h-fit">
            <h2 className="font-display text-2xl mb-6">Your bag</h2>
            <ul className="divide-y divide-border">
              {state.items.map((i) => (
                <li key={i.product.id + i.size} className="py-4 flex gap-4">
                  {i.product.image_url && (
                    <img src={i.product.image_url} alt="" className="w-16 h-20 object-cover" />
                  )}
                  <div className="flex-1 text-sm">
                    <p className="font-display text-base">{i.product.name}</p>
                    <p className="text-xs text-muted-foreground">Size {i.size} · Qty {i.quantity}</p>
                  </div>
                  <p className="font-display">${(Number(i.product.price) * i.quantity).toFixed(2)}</p>
                </li>
              ))}
            </ul>
            <div className="border-t border-border mt-4 pt-4 flex justify-between font-display text-lg">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </aside>
        </div>
      </section>
      <Footer />
    </div>
  );
}
