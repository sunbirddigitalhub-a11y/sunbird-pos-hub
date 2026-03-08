import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Industries", href: "/industries" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function WebsiteLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[hsl(220,15%,92%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/images/sunbird-logo.png" alt="SunbirdPOSHub" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-lg text-[hsl(220,15%,15%)]">SunbirdPOSHub</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === l.href
                    ? "text-[hsl(211,80%,50%)] bg-[hsl(211,80%,55%,0.08)]"
                    : "text-[hsl(220,10%,40%)] hover:text-[hsl(220,15%,15%)] hover:bg-[hsl(220,15%,96%)]"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-sm font-medium text-[hsl(220,10%,35%)] hover:text-[hsl(220,15%,15%)]">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="text-sm font-semibold rounded-lg bg-[hsl(211,80%,55%)] hover:bg-[hsl(211,80%,48%)] text-white px-5">
                Start Free Trial
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 text-[hsl(220,10%,35%)]" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[hsl(220,15%,92%)] bg-white px-4 pb-4">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm font-medium text-[hsl(220,10%,35%)] hover:text-[hsl(211,80%,50%)]"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-[hsl(220,15%,92%)]">
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-[hsl(211,80%,55%)] hover:bg-[hsl(211,80%,48%)] text-white">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-[hsl(220,15%,8%)] text-[hsl(220,10%,55%)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/images/sunbird-logo.png" alt="SunbirdPOSHub" className="w-8 h-8 rounded-lg object-cover" />
                <span className="font-bold text-white">SunbirdPOSHub</span>
              </div>
              <p className="text-sm leading-relaxed">Smart point of sale system for modern businesses across Africa.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Product</h4>
              <div className="space-y-2.5 text-sm">
                <Link to="/features" className="block hover:text-white transition-colors">Features</Link>
                <Link to="/pricing" className="block hover:text-white transition-colors">Pricing</Link>
                <Link to="/industries" className="block hover:text-white transition-colors">Industries</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Company</h4>
              <div className="space-y-2.5 text-sm">
                <Link to="/about" className="block hover:text-white transition-colors">About</Link>
                <Link to="/contact" className="block hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Get Started</h4>
              <div className="space-y-2.5 text-sm">
                <Link to="/login" className="block hover:text-white transition-colors">Login</Link>
                <Link to="/register" className="block hover:text-white transition-colors">Start Free Trial</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-[hsl(220,10%,18%)] pt-8 text-sm text-center">
            Sunbird Online Stores &copy; {new Date().getFullYear()} — sunbirdgroup.xyz
          </div>
        </div>
      </footer>
    </div>
  );
}
