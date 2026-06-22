export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-line bg-gradient-to-b from-cream-200/70 to-cream">
      <div className="container-pad py-12 sm:py-14">
        {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
