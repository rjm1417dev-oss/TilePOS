const logos = [
    'Zafar Traders',
    'Metro Builders',
    'Ayesha Tiles',
    'Royal Ceramics',
    'Pak Tile Co.',
    'StoneHub',
    'Prime Surfaces',
    'Crestile',
];

export function LogoMarquee() {
    return (
        <section className="border-y border-ink-100 bg-white/60 py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <p className="font-600 text-center text-xs tracking-widest text-ink-400 uppercase">
                    Trusted by tile businesses across the region
                </p>
                <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
                    <div className="animate-marquee flex w-max gap-12">
                        {[...logos, ...logos].map((name, i) => (
                            <span
                                key={i}
                                className="font-700 font-display text-lg whitespace-nowrap text-ink-300 select-none"
                            >
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
