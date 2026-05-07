export default function Footer() {
  return (
    <footer className="bg-espresso text-bone mt-32">
      <div className="container py-20 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <h3 className="font-display text-3xl mb-4">
            Maison <span className="italic font-light">Æra</span>
          </h3>
          <p className="text-bone/70 max-w-sm text-sm leading-relaxed">
            Considered clothing, made slowly in small ateliers across Europe. Pieces
            designed to outlive a season.
          </p>
          <form className="mt-8 flex border-b border-bone/30 max-w-sm">
            <input
              type="email"
              placeholder="Your email"
              className="bg-transparent flex-1 py-3 outline-none placeholder:text-bone/50 text-sm"
            />
            <button className="text-xs uppercase tracking-[0.2em] hover:text-ember transition-colors">
              Subscribe →
            </button>
          </form>
        </div>
        {[
          { title: "Shop", links: ["New In", "Outerwear", "Knitwear", "Bags", "Sale"] },
          { title: "Maison", links: ["Our Story", "Ateliers", "Sustainability", "Journal"] },
          { title: "Care", links: ["Contact", "Shipping", "Returns", "Size Guide"] },
        ].map((col) => (
          <div key={col.title}>
            <p className="text-xs uppercase tracking-[0.2em] mb-5 text-bone/60">{col.title}</p>
            <ul className="space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-ember transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-bone/10">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between text-xs text-bone/50">
          <p>© 2026 Maison Æra. All rights reserved.</p>
          <p>Crafted in Paris · Shipped worldwide</p>
        </div>
      </div>
    </footer>
  );
}
