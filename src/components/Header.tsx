import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, Search, Menu, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/shop?cat=Outerwear", label: "New In" },
  { to: "/shop?cat=Knitwear", label: "Knitwear" },
  { to: "/shop?cat=Bags", label: "Bags" },
  { to: "/journal", label: "Journal" },
];

export default function Header() {
  const { count, open } = useCart();
  const { user, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-500 ${
        scrolled ? "bg-bone/90 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="hidden md:block bg-espresso text-bone text-xs">
        <div className="overflow-hidden">
          <div className="marquee flex whitespace-nowrap py-2.5">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex shrink-0 items-center gap-12 pr-12">
                <span>Complimentary shipping on orders over $200</span>
                <span aria-hidden>·</span>
                <span>New arrivals — Autumn Editorial 26</span>
                <span aria-hidden>·</span>
                <span>Free returns within 30 days</span>
                <span aria-hidden>·</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container flex items-center justify-between h-16 md:h-20">
        <button className="md:hidden p-2 -ml-2" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>

        <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-[0.18em]">
          {nav.slice(0, 3).map((n) => (
            <NavLink
              key={n.label}
              to={n.to}
              className={({ isActive }) =>
                `underline-grow ${isActive ? "text-espresso" : "text-foreground/80 hover:text-foreground"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/" className="font-display text-2xl md:text-3xl tracking-tight">
          Maison <span className="italic font-light">Æra</span>
        </Link>

        <div className="flex items-center gap-1 md:gap-3">
          <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-[0.18em] mr-4">
            {nav.slice(3).map((n) => (
              <NavLink
                key={n.label}
                to={n.to}
                className="underline-grow text-foreground/80 hover:text-foreground"
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <button className="p-2" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
          {isAdmin && (
            <Link to="/admin" className="hidden md:inline text-[10px] uppercase tracking-[0.25em] underline-grow mr-1">
              Admin
            </Link>
          )}
          <Link to={user ? "/account" : "/auth"} className="p-2 hidden md:block" aria-label="Account">
            <User className="h-5 w-5" />
          </Link>
          <button onClick={open} className="p-2 relative" aria-label="Cart">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-ember text-bone text-[10px] font-medium rounded-full h-4 w-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
