import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[var(--secondary)] px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-5">
        <section className="rounded-2xl bg-[var(--primary)] p-6 text-white shadow-lg md:col-span-2 md:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-white/80">
            Get in touch
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">
            Contact Ratlami Interio
          </h1>
          <p className="mt-3 text-sm text-white/90">
            Have a project in mind or need help choosing products? Reach out
            and our team will get back to you soon.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-white/10 p-3">
              <Phone className="mt-0.5 h-5 w-5" />
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Phone
                </p>
                <p className="text-sm font-medium">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-white/10 p-3">
              <Mail className="mt-0.5 h-5 w-5" />
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Email 
                </p>
                <p className="text-sm font-medium">support@ratlamiinterio.com</p>
              </div>
            </div>        

             <div className="flex items-start gap-3 rounded-xl bg-white/10 p-3">
              <MapPin className="mt-0.5 h-5 w-5" />
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Address
                </p>
                <p className="text-sm font-medium">
                  Ratlam, Madhya Pradesh, India
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-lg md:col-span-3 md:p-8">
          <h2 className="text-2xl font-semibold text-[var(--black)]">
            Send us a message
          </h2>
          <p className="mt-2 text-sm text-[var(--darkgray)]">
            Fill in your details and our team will contact you.
          </p>

          <form className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[var(--black)]">
                  Full Name
                </span>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-lg border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[var(--black)]">
                  Phone Number
                </span>
                <input
                  type="tel"
                  placeholder="Your phone number"
                  className="w-full rounded-lg border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--black)]">
                Email Address
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--black)]">
                Message
              </span>
              <textarea
                rows={5}
                placeholder="Tell us about your requirement..."
                className="w-full rounded-lg border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
              />
            </label>

            <button
              type="submit"
              className="inline-flex rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Send Message
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
