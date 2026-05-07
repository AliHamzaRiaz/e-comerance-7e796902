import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, Truck, RotateCcw, Leaf } from "lucide-react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams();
  const { data: product, isLoading } = useProduct(slug);
  const { data: all = [] } = useProducts();
  const [size, setSize] = useState<string | null>(null);
  const { add } = useCart();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Product not found.</p>
      </div>
    );
  }

  const related = all.filter((p) => p.id !== product.id).slice(0, 3);

  const handleAdd = async () => {
    if (!size) {
      toast.error("Please select a size");
      return;
    }
    await add(product, size);
    toast.success(`${product.name} added to bag`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container pt-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] underline-grow"
        >
          <ArrowLeft className="h-3 w-3" /> Back to shop
        </Link>
      </div>

      <section className="container grid md:grid-cols-2 gap-10 md:gap-16 py-10 md:py-16">
        <div className="bg-cream aspect-[4/5] overflow-hidden">
          {product.image_url && (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex flex-col">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            {product.category}
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">{product.name}</h1>
          <p className="font-display text-2xl mt-4">${Number(product.price)}</p>

          <p className="mt-8 text-foreground/70 leading-relaxed max-w-md">
            {product.description}
          </p>

          <div className="mt-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.2em]">Size</p>
              <button className="text-xs underline-grow text-muted-foreground">Size guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-[3.5rem] py-3 px-4 border text-sm transition-colors ${
                    size === s
                      ? "border-espresso bg-espresso text-bone"
                      : "border-border hover:border-espresso"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="mt-8 bg-espresso text-bone py-5 text-xs uppercase tracking-[0.25em] hover:bg-ember transition-colors duration-500"
          >
            Add to bag — ${Number(product.price)}
          </button>

          <div className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t border-border">
            {[
              { i: Truck, t: "Free shipping over $200" },
              { i: RotateCcw, t: "30-day returns" },
              { i: Leaf, t: "Made responsibly" },
            ].map((f, k) => (
              <div key={k} className="text-center">
                <f.i className="h-5 w-5 mx-auto mb-2 text-clay" />
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground leading-snug">
                  {f.t}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-20">
        <h2 className="font-display text-3xl mb-10">
          You may also <span className="italic font-light">love</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
