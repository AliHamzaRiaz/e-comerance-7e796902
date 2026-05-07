import { createContext, useContext, useEffect, useReducer, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import type { Product } from "@/hooks/useProducts";

export type CartItem = {
  id?: string; // db row id when persisted
  product: Product;
  size: string;
  quantity: number;
};

type CartState = { items: CartItem[]; isOpen: boolean; loading: boolean };

type Action =
  | { type: "SET"; items: CartItem[] }
  | { type: "ADD"; product: Product; size: string }
  | { type: "REMOVE"; productId: string; size: string }
  | { type: "QTY"; productId: string; size: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE" }
  | { type: "LOADING"; loading: boolean };

const initial: CartState = { items: [], isOpen: false, loading: false };
const STORAGE_KEY = "maison_cart_guest";

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "SET":
      return { ...state, items: action.items };
    case "ADD": {
      const existing = state.items.find(
        (i) => i.product.id === action.product.id && i.size === action.size
      );
      const items = existing
        ? state.items.map((i) =>
            i === existing ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...state.items, { product: action.product, size: action.size, quantity: 1 }];
      return { ...state, items, isOpen: true };
    }
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter(
          (i) => !(i.product.id === action.productId && i.size === action.size)
        ),
      };
    case "QTY":
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.product.id === action.productId && i.size === action.size
              ? { ...i, quantity: Math.max(0, action.quantity) }
              : i
          )
          .filter((i) => i.quantity > 0),
      };
    case "CLEAR":
      return { ...state, items: [] };
    case "OPEN":
      return { ...state, isOpen: true };
    case "CLOSE":
      return { ...state, isOpen: false };
    case "TOGGLE":
      return { ...state, isOpen: !state.isOpen };
    case "LOADING":
      return { ...state, loading: action.loading };
  }
}

const CartContext = createContext<{
  state: CartState;
  add: (product: Product, size: string) => Promise<void>;
  remove: (productId: string, size: string) => Promise<void>;
  setQty: (productId: string, size: string, qty: number) => Promise<void>;
  clear: () => Promise<void>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  count: number;
  subtotal: number;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const { user } = useAuth();

  // Load on user change
  useEffect(() => {
    const load = async () => {
      if (user) {
        const { data } = await supabase
          .from("cart_items")
          .select("id, size, quantity, product:products(*)")
          .eq("user_id", user.id);
        const items: CartItem[] =
          (data ?? [])
            .filter((r: any) => r.product)
            .map((r: any) => ({
              id: r.id,
              size: r.size,
              quantity: r.quantity,
              product: r.product,
            }));

        // Merge guest cart on login
        const guestRaw = localStorage.getItem(STORAGE_KEY);
        if (guestRaw) {
          try {
            const guestItems: CartItem[] = JSON.parse(guestRaw);
            for (const g of guestItems) {
              const existing = items.find(
                (i) => i.product.id === g.product.id && i.size === g.size
              );
              if (existing) {
                const newQty = existing.quantity + g.quantity;
                await supabase
                  .from("cart_items")
                  .update({ quantity: newQty })
                  .eq("id", existing.id!);
                existing.quantity = newQty;
              } else {
                const { data: ins } = await supabase
                  .from("cart_items")
                  .insert({
                    user_id: user.id,
                    product_id: g.product.id,
                    size: g.size,
                    quantity: g.quantity,
                  })
                  .select("id")
                  .single();
                items.push({ ...g, id: ins?.id });
              }
            }
            localStorage.removeItem(STORAGE_KEY);
          } catch {}
        }

        dispatch({ type: "SET", items });
      } else {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            dispatch({ type: "SET", items: JSON.parse(raw) });
          } catch {
            dispatch({ type: "SET", items: [] });
          }
        } else {
          dispatch({ type: "SET", items: [] });
        }
      }
    };
    load();
  }, [user]);

  // Persist guest cart
  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    }
  }, [state.items, user]);

  const add = useCallback(
    async (product: Product, size: string) => {
      dispatch({ type: "ADD", product, size });
      if (user) {
        const existing = state.items.find(
          (i) => i.product.id === product.id && i.size === size
        );
        if (existing?.id) {
          await supabase
            .from("cart_items")
            .update({ quantity: existing.quantity + 1 })
            .eq("id", existing.id);
        } else {
          await supabase.from("cart_items").insert({
            user_id: user.id,
            product_id: product.id,
            size,
            quantity: 1,
          });
        }
      }
    },
    [user, state.items]
  );

  const remove = useCallback(
    async (productId: string, size: string) => {
      const target = state.items.find(
        (i) => i.product.id === productId && i.size === size
      );
      dispatch({ type: "REMOVE", productId, size });
      if (user && target?.id) {
        await supabase.from("cart_items").delete().eq("id", target.id);
      }
    },
    [user, state.items]
  );

  const setQty = useCallback(
    async (productId: string, size: string, qty: number) => {
      const target = state.items.find(
        (i) => i.product.id === productId && i.size === size
      );
      dispatch({ type: "QTY", productId, size, quantity: qty });
      if (user && target?.id) {
        if (qty <= 0) {
          await supabase.from("cart_items").delete().eq("id", target.id);
        } else {
          await supabase.from("cart_items").update({ quantity: qty }).eq("id", target.id);
        }
      }
    },
    [user, state.items]
  );

  const clear = useCallback(async () => {
    dispatch({ type: "CLEAR" });
    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const count = state.items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = state.items.reduce(
    (s, i) => s + i.quantity * Number(i.product.price),
    0
  );

  return (
    <CartContext.Provider
      value={{
        state,
        add,
        remove,
        setQty,
        clear,
        open: () => dispatch({ type: "OPEN" }),
        close: () => dispatch({ type: "CLOSE" }),
        toggle: () => dispatch({ type: "TOGGLE" }),
        count,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
