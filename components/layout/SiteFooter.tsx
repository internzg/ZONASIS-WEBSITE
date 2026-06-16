import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-[oklch(0.98_0.012_240)] pt-20 pb-10">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground">
            Curated travel experiences, unforgettable holidays, and reliable transport
            solutions across India.
          </p>
          <div className="mt-5 flex gap-3">
            <a aria-label="Instagram" href="https://instagram.com/zonasis" target="_blank" rel="noreferrer"
               className="rounded-full bg-white p-2 text-foreground shadow-soft transition hover:scale-105">
              <Instagram className="h-4 w-4" />
            </a>
            <a aria-label="Facebook" href="https://facebook.com/zonasis" target="_blank" rel="noreferrer"
               className="rounded-full bg-white p-2 text-foreground shadow-soft transition hover:scale-105">
              <Facebook className="h-4 w-4" />
            </a>
            <a aria-label="Twitter" href="https://twitter.com/zonasis" target="_blank" rel="noreferrer"
               className="rounded-full bg-white p-2 text-foreground shadow-soft transition hover:scale-105">
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/packages" className="hover:text-foreground">All Packages</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About Zonasis</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link to="/auth" className="hover:text-foreground">Sign in</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">Popular destinations</h4>
          <ul className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
            {["ooty","kodaikanal","kerala","goa","andaman","kashmir"].map((s) => (
              <li key={s}><Link to="/destinations/$slug" params={{ slug: s }} className="hover:text-foreground capitalize">{s}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">Get in touch</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 text-primary" /> hello@zonasis.com</li>
            <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-primary" /> +91 90000 00000</li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> Coimbatore, Tamil Nadu, India</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
        <span>© {new Date().getFullYear()} Zonasis Travel Pvt Ltd. All rights reserved.</span>
        <span>Made with care for travelers across India.</span>
      </div>
    </footer>
  );
}
