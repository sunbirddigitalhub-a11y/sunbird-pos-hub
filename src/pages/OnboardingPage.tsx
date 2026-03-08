import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, Upload, ArrowRight, Search, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const BUSINESS_CATEGORIES = [
  // Retail
  { value: "electronics", label: "Electronics & Gadgets", category: "Retail" },
  { value: "clothing_fashion", label: "Clothing & Fashion", category: "Retail" },
  { value: "supermarket", label: "Supermarket / Mini-mart", category: "Retail" },
  { value: "cosmetics_beauty", label: "Cosmetics & Beauty Products", category: "Retail" },
  { value: "shoes_accessories", label: "Shoes & Accessories", category: "Retail" },
  { value: "stationery_bookshop", label: "Stationery & Bookshop", category: "Retail" },
  { value: "kitchenware", label: "Kitchenware & Home Appliances", category: "Retail" },
  { value: "baby_kids", label: "Baby & Kids Store", category: "Retail" },
  { value: "jewelry", label: "Jewelry & Watches", category: "Retail" },
  { value: "general_merchandise", label: "General Merchandise", category: "Retail" },

  // Food & Beverage
  { value: "restaurant", label: "Restaurant / Café", category: "Food & Beverage" },
  { value: "bakery", label: "Bakery & Pastry Shop", category: "Food & Beverage" },
  { value: "bar_lounge", label: "Bar / Lounge / Pub", category: "Food & Beverage" },
  { value: "butchery", label: "Butchery / Meat Shop", category: "Food & Beverage" },
  { value: "grocery", label: "Grocery / Fresh Produce", category: "Food & Beverage" },
  { value: "fast_food", label: "Fast Food / Takeaway", category: "Food & Beverage" },
  { value: "water_beverages", label: "Water & Beverages Distributor", category: "Food & Beverage" },

  // Hardware & Construction
  { value: "hardware_shop", label: "Hardware Shop", category: "Hardware & Construction" },
  { value: "building_materials", label: "Building Materials", category: "Hardware & Construction" },
  { value: "paint_shop", label: "Paint & Decorations Shop", category: "Hardware & Construction" },
  { value: "timber_yard", label: "Timber Yard / Lumber", category: "Hardware & Construction" },
  { value: "plumbing_electrical", label: "Plumbing & Electrical Supplies", category: "Hardware & Construction" },

  // Automotive
  { value: "car_dealership", label: "Car Dealership / Showroom", category: "Automotive" },
  { value: "spare_parts", label: "Auto Spare Parts", category: "Automotive" },
  { value: "garage_workshop", label: "Garage / Workshop", category: "Automotive" },
  { value: "car_wash", label: "Car Wash", category: "Automotive" },
  { value: "motorcycle_dealer", label: "Motorcycle / Boda-Boda Dealer", category: "Automotive" },
  { value: "tyre_battery", label: "Tyre & Battery Shop", category: "Automotive" },

  // Real Estate & Property
  { value: "real_estate_agency", label: "Real Estate Agency", category: "Real Estate" },
  { value: "property_management", label: "Property Management", category: "Real Estate" },
  { value: "rental_apartments", label: "Rental Apartments / Hostels", category: "Real Estate" },
  { value: "hotel_lodge", label: "Hotel / Lodge / Guest House", category: "Real Estate" },

  // Health & Wellness
  { value: "pharmacy", label: "Pharmacy / Drug Shop", category: "Health & Wellness" },
  { value: "clinic", label: "Clinic / Medical Center", category: "Health & Wellness" },
  { value: "gym_fitness", label: "Gym / Fitness Center", category: "Health & Wellness" },
  { value: "salon_barbershop", label: "Salon / Barbershop", category: "Health & Wellness" },
  { value: "spa", label: "Spa & Massage", category: "Health & Wellness" },

  // Agriculture
  { value: "agro_inputs", label: "Agro Inputs / Farm Supplies", category: "Agriculture" },
  { value: "farm_produce", label: "Farm Produce / Harvest Sales", category: "Agriculture" },
  { value: "veterinary", label: "Veterinary / Animal Health", category: "Agriculture" },
  { value: "poultry_livestock", label: "Poultry & Livestock", category: "Agriculture" },
  { value: "agro_processing", label: "Agro Processing / Milling", category: "Agriculture" },

  // Services
  { value: "printing_design", label: "Printing & Design Services", category: "Services" },
  { value: "laundry", label: "Laundry / Dry Cleaning", category: "Services" },
  { value: "cleaning_services", label: "Cleaning Services", category: "Services" },
  { value: "event_planning", label: "Event Planning & Decoration", category: "Services" },
  { value: "transport_logistics", label: "Transport & Logistics", category: "Services" },
  { value: "courier_delivery", label: "Courier & Delivery", category: "Services" },
  { value: "photography", label: "Photography / Studio", category: "Services" },
  { value: "ict_services", label: "ICT / Computer Services", category: "Services" },
  { value: "tailoring", label: "Tailoring / Fashion Design", category: "Services" },

  // Education & Training
  { value: "school", label: "School / Academy", category: "Education" },
  { value: "bookshop", label: "Bookshop / Learning Materials", category: "Education" },
  { value: "training_center", label: "Training Center / Vocational", category: "Education" },

  // Wholesale & Distribution
  { value: "wholesale", label: "Wholesale Distributor", category: "Wholesale & Distribution" },
  { value: "warehouse", label: "Warehouse / Go-Down", category: "Wholesale & Distribution" },
  { value: "import_export", label: "Import & Export", category: "Wholesale & Distribution" },

  // Other
  { value: "forex_bureau", label: "Forex Bureau", category: "Finance" },
  { value: "mobile_money", label: "Mobile Money / Airtime Agent", category: "Finance" },
  { value: "fuel_station", label: "Fuel / Petrol Station", category: "Energy" },
  { value: "gas_dealer", label: "Gas / Cooking Gas Dealer", category: "Energy" },
  { value: "custom", label: "Other (Type your business)", category: "Other" },
];

const CURRENCIES = [
  { value: "UGX", label: "UGX – Ugandan Shilling" },
  { value: "KES", label: "KES – Kenyan Shilling" },
  { value: "TZS", label: "TZS – Tanzanian Shilling" },
  { value: "RWF", label: "RWF – Rwandan Franc" },
  { value: "BIF", label: "BIF – Burundian Franc" },
  { value: "SSP", label: "SSP – South Sudanese Pound" },
  { value: "ETB", label: "ETB – Ethiopian Birr" },
  { value: "NGN", label: "NGN – Nigerian Naira" },
  { value: "GHS", label: "GHS – Ghanaian Cedi" },
  { value: "ZAR", label: "ZAR – South African Rand" },
  { value: "USD", label: "USD – US Dollar" },
  { value: "EUR", label: "EUR – Euro" },
  { value: "GBP", label: "GBP – British Pound" },
];

const OnboardingPage = () => {
  const { user, businessId, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({
    businessName: "",
    businessType: "",
    customBusinessType: "",
    logoUrl: "",
    address: "",
    phone: "",
    email: "",
    currency: "UGX",
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const filteredCategories = searchQuery
    ? BUSINESS_CATEGORIES.filter(
        (b) =>
          b.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : BUSINESS_CATEGORIES;

  const groupedCategories = filteredCategories.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof BUSINESS_CATEGORIES>);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !businessId) return;
    const ext = file.name.split(".").pop();
    const path = `${businessId}/logo.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    update("logoUrl", urlData.publicUrl);
    toast({ title: "Logo uploaded!" });
  };

  const handleComplete = async () => {
    if (!businessId) return;
    setLoading(true);
    const businessType =
      form.businessType === "custom" ? form.customBusinessType : BUSINESS_CATEGORIES.find((b) => b.value === form.businessType)?.label || form.businessType;

    const { error } = await supabase
      .from("businesses")
      .update({
        name: form.businessName || undefined,
        business_type: businessType || undefined,
        logo_url: form.logoUrl || undefined,
        address: form.address || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        currency: form.currency,
        onboarding_completed: true,
      } as any)
      .eq("id", businessId);

    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome aboard! 🎉", description: "Your business is set up and ready to go." });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleSkip = async () => {
    if (!businessId) return;
    setLoading(true);
    await supabase.from("businesses").update({ onboarding_completed: true } as any).eq("id", businessId);
    navigate("/dashboard");
    setLoading(false);
  };

  const selectedType = BUSINESS_CATEGORIES.find((b) => b.value === form.businessType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(211,80%,97%)] via-white to-[hsl(211,80%,95%)] flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-2 rounded-full transition-all ${s === step ? "w-10 bg-[hsl(211,80%,55%)]" : s < step ? "w-10 bg-[hsl(211,80%,75%)]" : "w-10 bg-[hsl(220,15%,90%)]"}`} />
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 border border-[hsl(220,15%,92%)] shadow-lg">
          {/* Step 1: Business Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-[hsl(211,80%,95%)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-7 h-7 text-[hsl(211,80%,55%)]" />
                </div>
                <h1 className="text-2xl font-bold text-[hsl(220,15%,15%)]">What kind of business do you run?</h1>
                <p className="text-sm text-[hsl(220,10%,45%)] mt-2">We'll customize your POS experience for your industry</p>
              </div>

              <div>
                <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">Business Name</label>
                <Input value={form.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="e.g. Kampala Electronics Hub" className="rounded-lg h-11" />
              </div>

              <div>
                <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">Business Type</label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(220,10%,60%)]" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search business type..."
                    className="rounded-lg h-11 pl-9"
                  />
                </div>
                <div className="max-h-52 overflow-y-auto border border-[hsl(220,15%,92%)] rounded-lg">
                  {Object.entries(groupedCategories).map(([category, items]) => (
                    <div key={category}>
                      <div className="px-3 py-1.5 bg-[hsl(220,15%,97%)] text-xs font-semibold text-[hsl(220,10%,45%)] uppercase tracking-wider sticky top-0">{category}</div>
                      {items.map((item) => (
                        <button
                          key={item.value}
                          onClick={() => update("businessType", item.value)}
                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-[hsl(211,80%,97%)] flex items-center justify-between transition-colors ${
                            form.businessType === item.value ? "bg-[hsl(211,80%,95%)] text-[hsl(211,80%,45%)] font-medium" : "text-[hsl(220,15%,25%)]"
                          }`}
                        >
                          {item.label}
                          {form.businessType === item.value && <Check className="w-4 h-4 text-[hsl(211,80%,55%)]" />}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {form.businessType === "custom" && (
                <div>
                  <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">Describe your business</label>
                  <Input value={form.customBusinessType} onChange={(e) => update("customBusinessType", e.target.value)} placeholder="e.g. Art Gallery & Framing" className="rounded-lg h-11" />
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSkip} disabled={loading} className="flex-1 h-11 rounded-xl">
                  Skip for now
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!form.businessName}
                  className="flex-1 h-11 rounded-xl bg-[hsl(211,80%,55%)] hover:bg-[hsl(211,80%,48%)] text-white font-semibold gap-2"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Contact & Location */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-[hsl(220,15%,15%)]">Business Details</h1>
                <p className="text-sm text-[hsl(220,10%,45%)] mt-2">This info will appear on your receipts and invoices</p>
              </div>

              <div>
                <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">Business Phone</label>
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+256 700 000 000" className="rounded-lg h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">Business Email</label>
                <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="sales@yourbusiness.com" className="rounded-lg h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">Business Address</label>
                <Textarea value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Plot 12, Kampala Road, Kampala" className="rounded-lg min-h-[70px]" />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(220,15%,15%)] block mb-1.5">Currency</label>
                <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                  <SelectTrigger className="rounded-lg h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-11 rounded-xl">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1 h-11 rounded-xl bg-[hsl(211,80%,55%)] hover:bg-[hsl(211,80%,48%)] text-white font-semibold gap-2">
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Logo & Finish */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-[hsl(220,15%,15%)]">Brand Your Store</h1>
                <p className="text-sm text-[hsl(220,10%,45%)] mt-2">Upload your business logo (optional)</p>
              </div>

              <div className="flex flex-col items-center gap-4">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Business logo" className="w-24 h-24 rounded-2xl object-cover border-2 border-[hsl(211,80%,85%)]" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-[hsl(220,15%,85%)] flex items-center justify-center bg-[hsl(220,15%,97%)]">
                    <Upload className="w-8 h-8 text-[hsl(220,10%,60%)]" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <span className="text-sm text-[hsl(211,80%,50%)] hover:underline font-medium">{form.logoUrl ? "Change logo" : "Upload logo"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>

              {/* Summary */}
              <div className="bg-[hsl(220,15%,97%)] rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-semibold text-[hsl(220,15%,15%)]">Summary</h3>
                <div className="text-sm text-[hsl(220,10%,35%)] space-y-1">
                  <p><span className="font-medium">Business:</span> {form.businessName || "—"}</p>
                  <p><span className="font-medium">Type:</span> {form.businessType === "custom" ? form.customBusinessType : selectedType?.label || "—"}</p>
                  <p><span className="font-medium">Currency:</span> {form.currency}</p>
                  {form.phone && <p><span className="font-medium">Phone:</span> {form.phone}</p>}
                  {form.email && <p><span className="font-medium">Email:</span> {form.email}</p>}
                  {form.address && <p><span className="font-medium">Address:</span> {form.address}</p>}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-11 rounded-xl">Back</Button>
                <Button onClick={handleComplete} disabled={loading} className="flex-1 h-11 rounded-xl bg-[hsl(145,60%,42%)] hover:bg-[hsl(145,60%,36%)] text-white font-semibold gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {loading ? "Setting up..." : "Launch My Store"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
