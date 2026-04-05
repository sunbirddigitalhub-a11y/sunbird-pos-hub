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
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[hsl(210,18%,92%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 md:h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/images/sunbird-logo.png" alt="SunbirdPOSHub" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-lg text-[hsl(213,29%,17%)]">SunbirdPOSHub</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === l.href
                    ? "text-[hsl(186,96%,21%)] bg-[hsl(186,96%,21%,0.08)]"
                    : "text-[hsl(220,9%,46%)] hover:text-[hsl(213,29%,17%)] hover:bg-[hsl(192,16%,96%)]"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-sm font-medium text-[hsl(220,9%,46%)] hover:text-[hsl(213,29%,17%)]">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="text-sm font-semibold rounded-lg bg-[hsl(186,96%,21%)] hover:bg-[hsl(186,90%,25%)] text-white px-5">
                Start Free Trial
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[hsl(192,16%,96%)] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-[hsl(210,18%,92%)] bg-white/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === l.href
                      ? "text-[hsl(186,96%,21%)] bg-[hsl(186,96%,21%,0.08)]"
                      : "text-[hsl(220,9%,46%)] hover:bg-[hsl(192,16%,96%)]"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-[hsl(210,18%,92%)] space-y-2">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full h-11 rounded-xl text-sm font-semibold border-[hsl(210,18%,88%)]">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full h-11 rounded-xl text-sm font-semibold bg-[hsl(186,96%,21%)] hover:bg-[hsl(186,90%,25%)] text-white">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-[hsl(213,29%,10%)] text-[hsl(220,9%,55%)] py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 md:mb-12">
            <div className="col-span-2 sm:col-span-1">
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
          <div className="border-t border-white/10 pt-6 md:pt-8 text-sm text-center">
            Sunbird Online Stores &copy; {new Date().getFullYear()} — sunbirdgroup.xyz
          </div>
        </div>
      </footer>
    </div>
  );
}
