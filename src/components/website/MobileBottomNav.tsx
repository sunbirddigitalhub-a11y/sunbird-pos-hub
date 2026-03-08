import { Link, useLocation } from "react-router-dom";
import { Home, Search, Megaphone, MessageCircle, User } from "lucide-react";

const tabs = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Search", icon: Search, href: "/features" },
  { label: "My Ads", icon: Megaphone, href: "/pricing" },
  { label: "Chats", icon: MessageCircle, href: "/contact" },
  { label: "Profile", icon: User, href: "/login" },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="mobile-bottom-nav md:hidden">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.href;
        return (
          <Link
            key={tab.label}
            to={tab.href}
            className={`mobile-bottom-nav-item ${isActive ? "active" : ""}`}
          >
            <tab.icon className="h-5 w-5" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
