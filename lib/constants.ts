export interface CrisisHotline {
  name: string;
  number: string;
  description: string;
}

export const CRISIS_HOTLINES: CrisisHotline[] = [
  {
    name: "NCMH Crisis Hotline",
    number: "1553",
    description: "National Center for Mental Health — 24/7, toll-free",
  },
  {
    name: "Hopeline PH",
    number: "0917-558-4673",
    description: "Crisis support via call or text (Globe/TM: 2919 toll-free)",
  },
  {
    name: "In Touch Community Services",
    number: "(02) 8893-7603",
    description: "Crisis Line for emotional and mental health support",
  },
  {
    name: "Manila Lifeline Centre",
    number: "(02) 8969-1415",
    description: "Suicide prevention and emotional support",
  },
];

export const CRISIS_RESPONSE_MESSAGE = `You are not alone, and help is available right now. Please reach out to any of these crisis support services immediately:

${CRISIS_HOTLINES.map(
  (h) => `**${h.name}**: [${h.number}](tel:${h.number.replace(/[() -]/g, "")}) — ${h.description}`
).join("\n\n")}

If you or someone you know is in immediate danger, please call emergency services at **911**.

These trained professionals are here to help you, 24/7. You matter, and reaching out is a sign of strength.`;

export const WELCOME_MESSAGE = `Hello! I'm the MHPH Directory Assistant. I can help you find mental health service providers across the Philippines.

You can tell me what you're looking for in your own words. For example:
- What kind of support you need (therapy, counseling, psychiatric evaluation)
- Any specific concerns (anxiety, depression, family issues)
- Your preferred location or region
- Whether you prefer online or in-person sessions

How can I help you today?`;

export const DISCLAIMER_TEXT =
  "This is a provider directory tool, not a diagnostic or therapeutic AI. It does not provide diagnoses, therapy, or medical advice. If you are in crisis, please call 1553 (NCMH Crisis Hotline).";

export const SUGGESTION_CHIPS = [
  "Find a therapist for anxiety in Metro Manila",
  "Where can I get psychiatric evaluation in Cebu?",
  "I need affordable online counseling",
];

export const COLUMN_PATTERNS: Record<string, string> = {
  name: "Name of Facility",
  region: "Region",
  province: "Provinces",
  status: "Status",
  phone: "Phone Number",
  email: "Email Address",
  location: "Location",
  faxNumber: "Fax Number",
  websiteUrl: "Website URL",
  facebook: "Facebook Account URL",
  instagram: "Instagram URL",
  linkedin: "LinkedIn URL",
  twitter: "Twitter URL",
  youtube: "YouTube URL",
  flickr: "Flickr URL",
  photoUrl: "Photo of the Facility",
  description: "Description of the Facility",
  videoUrl: "Video URL",
  priceRange: "Price Range of Services",
  openingHours: "Opening Hours",
  dateOfEstablishment: "Date of Establishment of Facility",
  mhpssLevel: "MHPSS Level",
  mhpssLevelFromDb: "MHPSS LEVEL FROM DATABASE",
};

export const MULTI_COLUMN_PATTERNS: Record<string, string> = {
  categories: "Category",
  classifications: "Classification",
  servicesOffered: "Services Offered",
  specializations: "Specialization",
  modeOfDelivery: "Mode of Delivery",
  modeOfPayment: "Mode of Payment",
  inclusivityTags: "Inclusivity Tags",
};

export const MAX_RESULTS = 5;
export const CACHE_TTL_MS =
  (parseInt(process.env.CACHE_TTL_HOURS || "3", 10) || 3) * 60 * 60 * 1000;
