// SiteKit data — REAL data from the live lanesite.pro Maple Bakery demo,
// verified 2026-11-11 from the public page. Nothing invented.
// Sources: https://lanesite.pro/ (hero, menu, order box, build log, pricing).
// If the live site changes, update this file — never invent a price or stat.

export const BAKERY = {
  name: "Maple Bakery",
  area: "Park Slope, Brooklyn",
  domain: "maple-bakery.lanesite.pro",
  tagline: "Fresh bread and cakes, baked every morning.",
  sub: "Order online or pick up from the shop. Open 7am to 10pm.",
  hours: "Open 7am to 10pm",
  nav: ["Home", "Menu", "Gallery", "Contact"],
  menu: [
    { name: "Fresh milk bread", price: "$5" },
    { name: "Chocolate fudge cake, 2 lb", price: "$48" },
    { name: "Chicken patties, box of 6", price: "$12" },
  ],
  // Live site order box lists these three pickup times.
  pickupTimes: ["11:00", "4:30", "7:00"],
  chips: ["Open now", "Online orders"],
  // Live build log (7 steps on lanesite.pro).
  buildSteps: [
    { label: "Reading your brief", sub: "Maple Bakery · Park Slope, Brooklyn" },
    { label: "Choosing layout and colors", sub: "Palette: warm crust" },
    { label: "Finding photos", sub: "bread, cakes, bakery counter" },
    { label: "Writing the pages", sub: "Home · Menu · Gallery · Contact" },
    { label: "Adding bookings and your dashboard", sub: "Order form · owner dashboard" },
    { label: "Testing in a real browser", sub: "5 pages · 1 form · 0 broken links" },
    { label: "Publishing with HTTPS", sub: "maple-bakery.lanesite.pro" },
  ],
  // Live pricing (for the end-card value line).
  pricing: { free: "$0", pro: "$5", proNote: "a month", trial: "7 days free" },
} as const;

// Demo data — labelled as demo wherever it appears on screen.
// The dashboard count-up (18 inquiries) is NOT real customer data.
export const DEMO = {
  inquiries: 18,
  label: "customer inquiries",
  demoTag: "DEMO DATA",
} as const;
