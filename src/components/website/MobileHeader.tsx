import { MapPin, Search, Bell } from "lucide-react";

export function MobileHeader() {
  return (
    <header className="mobile-sticky-header md:hidden">
      <button className="mobile-location-selector">
        <MapPin className="h-4 w-4" />
        <span>Kampala</span>
      </button>
      <div className="mobile-search-bar">
        <Search className="h-4 w-4 text-[#6B7280]" />
        <span className="text-sm text-[#6B7280]">Search phones, laptops, cars…</span>
      </div>
      <button className="mobile-notification-btn">
        <Bell className="h-5 w-5" />
      </button>
    </header>
  );
}
