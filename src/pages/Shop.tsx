import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";

const categories = ["All", "Outerwear", "Knitwear", "Dresses", "Shirts", "Trousers", "Bags"];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("cat") || "All";
  const [active, setActive] = useState(initial);
  const [sort, setSort] = useState("featured");
  const { data: products = [], isLoading } = useProducts();

  const filtered = useMemo(() => {
    const list = active === "All" ? products : products.filter((p) => p.category === active);
    const sorted = [...list];
    if (sort === "low") sorted.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "high") sorted.sort((a, b) => Number(b.price) - Number(a.price));
    return sorted;
  }, [active, sort, products]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container pt-12 md:pt-20 pb-10">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
          The Collection
        </p>
        <h1 className="font-display text-5xl md:text-6xl">
          Autumn <span className="italic font-light">Edit</span>
        </h1>
      </section>

      <div className="container border-y border-border py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-16 md:top-20 bg-bone/95 backdrop-blur z-30">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.2em]">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
                setActive(c);
                if (c === "All") setParams({});
                else setParams({ cat: c });
              }}
              className={`underline-grow transition-colors ${
                active === c ? "text-ember" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
          <label className="text-muted-foreground">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent border-b border-border py-1 outline-none uppercase tracking-[0.2em] text-xs"
          >
            <option value="featured">Featured</option>
            <option value="low">Price · Low</option>
            <option value="high">Price · High</option>
          </select>
        </div>
      </div>

      <section className="container py-16">
        {isLoading ? (
          <p className="text-center text-muted-foreground text-xs uppercase tracking-[0.3em]">Loading…</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
