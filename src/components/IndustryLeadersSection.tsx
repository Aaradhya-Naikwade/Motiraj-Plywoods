import { getIndustryLeaders } from "@/lib/industry-leaders-repo";

export default async function IndustryLeadersSection() {
  const leaders = await getIndustryLeaders();
  const completeLeaders = leaders.filter(
    (leader) =>
      leader.name.trim() &&
      leader.designation.trim() &&
      leader.message.trim() &&
      leader.image_url.trim()
  );

  if (completeLeaders.length < 3) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fbf6ef_0%,#f5ece1_100%)] px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--darkgray)]">Leadership Voices</p>
          <h2 className="mt-3 text-3xl font-bold text-[var(--black)] md:text-4xl">Industry Leaders Speak</h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-[var(--darkgray)] md:text-base">
            Messages and insights from the leadership of the Plywood Association and our top performer.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:mt-12 md:grid-cols-3">
          {completeLeaders.map((leader) => (
            <article
              key={leader.name}
              className={`relative rounded-2xl border p-6 shadow-[0_12px_30px_rgba(27,20,12,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(27,20,12,0.14)] ${
                leader.role === "top_performer"
                  ? "border-[#d8b58d] bg-[linear-gradient(160deg,#fff9f2_0%,#fff2df_100%)]"
                  : "border-[#e8ddd0] bg-white"
              }`}
            >
              {leader.role === "top_performer" ? (
                <span className="absolute right-4 top-4 rounded-full bg-[#be7b2c] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Top Performer
                </span>
              ) : null}

              <div className="flex flex-col items-start gap-4">
                <img
                  src={leader.image_url}
                  alt={leader.name}
                  className="h-56 w-full rounded-xl border-2 border-white object-cover shadow-md md:h-52"
                />
                <div>
                  <h3 className="text-lg font-semibold text-[var(--black)]">{leader.name}</h3>
                  <p className="text-xs font-medium leading-relaxed text-[var(--darkgray)]">{leader.designation}</p>
                </div>
              </div>

              <blockquote className="mt-5 border-l-2 border-[var(--primary)]/50 pl-4 text-sm italic leading-relaxed text-[var(--black)]">
                "{leader.message}"
              </blockquote>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
