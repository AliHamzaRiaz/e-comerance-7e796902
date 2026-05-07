import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import hero from "@/assets/hero.jpg";
import editorial from "@/assets/editorial.jpg";

const Index = () => {
  const { data: products = [] } = useProducts();
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative">
        <div className="grid md:grid-cols-12 min-h-[88vh]">
          <div className="md:col-span-5 flex flex-col justify-between p-8 md:p-16 order-2 md:order-1">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground reveal">
                Autumn / Winter — Edition 26
              </p>
            </div>
            <div className="reveal reveal-delay-1">
              <h1 className="font-display text-5xl md:text-7xl leading-[0.95] text-balance">
                Quiet pieces,
                <br />
                <span className="italic font-light">loud</span> presence.
              </h1>
              <p className="mt-8 max-w-md text-foreground/70 leading-relaxed">
                A new chapter of considered tailoring, soft volumes and grounded tones.
                Made slowly, worn always.
              </p>
              <div className="mt-10 flex items-center gap-6">
                <Link
                  to="/shop"
                  className="bg-espresso text-bone px-8 py-4 text-xs uppercase tracking-[0.25em] hover:bg-ember transition-colors duration-500 inline-flex items-center gap-3"
                >
                  Shop the edit <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link to="/journal" className="text-xs uppercase tracking-[0.25em] underline-grow">
                  Read the journal
                </Link>
              </div>
            </div>
            <div className="hidden md:flex items-end justify-between text-xs text-muted-foreground reveal reveal-delay-2">
              <span>01 — Featured Look</span>
              <span>Photographed in Paris</span>
            </div>
          </div>
          <div className="md:col-span-7 relative order-1 md:order-2 overflow-hidden">
            <img
              src={hero}
              alt="Maison Æra autumn campaign"
              className="w-full h-full object-cover min-h-[60vh] md:min-h-full reveal"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      {/* MARQUEE BAR */}
      <section className="bg-cream border-y border-border overflow-hidden">
        <div className="marquee flex whitespace-nowrap py-6 font-display text-2xl md:text-3xl">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex shrink-0 items-center gap-12 pr-12">
              <span>Tailoring</span>
              <span className="italic font-light text-clay">·</span>
              <span>Cashmere</span>
              <span className="italic font-light text-clay">·</span>
              <span>Silk</span>
              <span className="italic font-light text-clay">·</span>
              <span>Vegetable-tanned leather</span>
              <span className="italic font-light text-clay">·</span>
              <span>Italian wool</span>
              <span className="italic font-light text-clay">·</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED EDIT */}
      <section className="container py-24 md:py-32">
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
              The Edit — 06 Pieces
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-balance max-w-2xl">
              Built to be worn, again
              <br />
              and <span className="italic font-light">again</span>.
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden md:inline-flex text-xs uppercase tracking-[0.25em] underline-grow items-center gap-2"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* EDITORIAL SPLIT */}
      <section className="relative">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-[4/5] md:aspect-auto overflow-hidden">
            <img src={editorial} alt="Autumn editorial" loading="lazy" className="w-full h-full object-cover" />
          </div>
          <div className="bg-espresso text-bone p-10 md:p-20 flex flex-col justify-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-bone/60 mb-6">Journal — N°14</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight text-balance">
              On dressing without
              <br />
              <span className="italic font-light">noise</span>.
            </h2>
            <p className="mt-8 max-w-md text-bone/70 leading-relaxed">
              A conversation with our creative director on building a wardrobe that
              speaks softly — and lasts a decade.
            </p>
            <Link
              to="/journal"
              className="mt-10 inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-bone hover:text-ember transition-colors w-fit"
            >
              Read the essay <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="container py-24 md:py-32">
        <div className="grid md:grid-cols-3 gap-12 md:gap-20">
          {[
            {
              n: "01",
              t: "Made slowly",
              d: "Each piece is cut and sewn in small ateliers across Italy, France and Portugal.",
            },
            {
              n: "02",
              t: "Honest materials",
              d: "Italian wools, vegetable-tanned leathers, GOTS cotton — chosen to last and to age.",
            },
            {
              n: "03",
              t: "A wardrobe, not a season",
              d: "Designed in conversation with previous collections — pieces that layer, year on year.",
            },
          ].map((v) => (
            <div key={v.n}>
              <p className="font-display text-5xl text-clay mb-6">{v.n}</p>
              <h3 className="font-display text-2xl mb-3">{v.t}</h3>
              <p className="text-muted-foreground leading-relaxed">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
