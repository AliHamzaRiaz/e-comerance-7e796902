import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";

const categories = [
  "All",
  "Outerwear",
  "Knitwear",
  "Dresses",
  "Shirts",
  "Trousers",
  "Bags",
  "Lingerie",
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("cat") || "All";
  const [active, setActive] = useState(initial);
  const [sort, setSort] = useState("featured");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const { data: products = [], isLoading } = useProducts();

  const filtered = useMemo(() => {
    let list = active === "All" ? products : products.filter((p) => p.category === active);
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) list = list.filter((p) => Number(p.price) >= min);
    if (!isNaN(max)) list = list.filter((p) => Number(p.price) <= max);
    const sorted = [...list];
    if (sort === "low") sorted.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "high") sorted.sort((a, b) => Number(b.price) - Number(a.price));
    return sorted;
  }, [active, sort, products, minPrice, maxPrice]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container pt-12 md:pt-16 pb-8">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
          The Collection
        </p>
        <h1 className="font-display text-5xl md:text-6xl">
          Autumn <span className="italic font-light">Edit</span>
        </h1>
      </section>

      <div className="container pb-20 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">
        {/* Sidebar filters */}
        <aside className="space-y-8 md:sticky md:top-24 md:self-start">
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Categories
            </h3>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c}>
                  <button
                    onClick={() => {
                      setActive(c);
                      if (c === "All") setParams({});
                      else setParams({ cat: c });
                    }}
                    className={`text-sm underline-grow transition-colors ${
                      active === c
                        ? "text-ember font-medium"
                        : "text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Price
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="$ Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-transparent border border-border px-3 py-2 text-sm outline-none focus:border-ember"
              />
              <span className="text-muted-foreground">—</span>
              <input
                type="number"
                placeholder="$ Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-transparent border border-border px-3 py-2 text-sm outline-none focus:border-ember"
              />
            </div>
          </div>
        </aside>

        {/* Main grid */}
        <div>
          <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </p>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
              <label className="text-muted-foreground">Sort by</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent border-b border-border py-1 outline-none uppercase tracking-[0.2em] text-xs"
              >
                <option value="featured">Best match</option>
                <option value="low">Price · Low</option>
                <option value="high">Price · High</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <p className="text-center text-muted-foreground text-xs uppercase tracking-[0.3em] py-20">
              Loading…
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-20">
              No products match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
