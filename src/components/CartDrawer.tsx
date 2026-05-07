import { useCart } from "@/context/CartContext";
import { X, Minus, Plus } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function CartDrawer() {
  const { state, close, remove, setQty, subtotal } = useCart();

  useEffect(() => {
    document.body.style.overflow = state.isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [state.isOpen]);

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 bg-espresso/40 z-50 transition-opacity duration-500 ${
          state.isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-bone z-50 shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          state.isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-2xl">Your Bag</h2>
          <button onClick={close} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {state.items.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <p className="font-display text-xl text-foreground mb-2">Your bag is empty</p>
              <p className="text-sm">Discover something worth keeping.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {state.items.map((item) => (
                <li key={item.product.id + item.size} className="p-6 flex gap-4">
                  {item.product.image_url && (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-24 h-32 object-cover"
                    />
                  )}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-display text-lg leading-tight">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">Size {item.size}</p>
                      </div>
                      <button
                        onClick={() => remove(item.product.id, item.size)}
                        className="text-xs underline-grow"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-auto flex justify-between items-center">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => setQty(item.product.id, item.size, item.quantity - 1)}
                          className="p-2 hover:bg-cream"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-sm w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => setQty(item.product.id, item.size, item.quantity + 1)}
                          className="p-2 hover:bg-cream"
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="font-display">${item.product.price * item.quantity}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {state.items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-display text-lg">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Shipping and taxes calculated at checkout.
            </p>
            <Link
              to="/checkout"
              onClick={close}
              className="block text-center w-full bg-espresso text-bone py-4 text-xs uppercase tracking-[0.25em] hover:bg-ember transition-colors duration-500"
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
