import { Link } from "react-router-dom";
import type { Product } from "@/hooks/useProducts";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="bg-cream aspect-[4/5] overflow-hidden">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        )}
        {product.tag && (
          <span className="absolute m-3 -translate-y-full text-[10px] uppercase tracking-[0.25em] bg-bone px-2 py-1">
            {product.tag}
          </span>
        )}
      </div>
      <div className="pt-4 flex justify-between items-start gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-1">
            {product.category}
          </p>
          <p className="font-display text-lg leading-tight">{product.name}</p>
        </div>
        <p className="font-display text-lg whitespace-nowrap">${Number(product.price)}</p>
      </div>
    </Link>
  );
}
