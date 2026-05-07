import Header from "@/components/Header";
import Footer from "@/components/Footer";
import editorial from "@/assets/editorial.jpg";

const posts = [
  {
    n: "N°14",
    title: "On dressing without noise",
    excerpt: "A conversation with our creative director on quiet wardrobes.",
    cat: "Essay",
  },
  {
    n: "N°13",
    title: "The making of a trench",
    excerpt: "Inside the small atelier outside Florence where every coat begins.",
    cat: "Atelier",
  },
  {
    n: "N°12",
    title: "Five ways with a slip dress",
    excerpt: "From Tuesday breakfast to Saturday night — without changing.",
    cat: "Styling",
  },
];

export default function Journal() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container py-20 md:py-28">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
          The Journal
        </p>
        <h1 className="font-display text-5xl md:text-7xl text-balance max-w-3xl">
          Stories from the <span className="italic font-light">atelier</span>.
        </h1>
      </section>
      <section className="container pb-24 grid md:grid-cols-3 gap-10">
        {posts.map((p, i) => (
          <article key={p.n} className="group">
            <div className="aspect-[4/5] bg-cream overflow-hidden mb-6">
              <img
                src={editorial}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover product-img"
                style={{ objectPosition: `${i * 30}% center` }}
              />
            </div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
              {p.n} — {p.cat}
            </p>
            <h2 className="font-display text-2xl mb-3 leading-tight">{p.title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{p.excerpt}</p>
          </article>
        ))}
      </section>
      <Footer />
    </div>
  );
}
