export interface Provider {
  name: string;
  region: string;
  province: string;
  status: string;
  phone: string;
  email: string;
  categories: string[];
  classifications: string[];
  servicesOffered: string[];
  specializations: string[];
  mhpssLevel: string;
  mhpssLevelFromDb: string;
  modeOfDelivery: string[];
  modeOfPayment: string[];
  location: string;
  faxNumber: string;
  websiteUrl: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    flickr?: string;
  };
  photoUrl: string;
  description: string;
  videoUrl: string;
  priceRange: string;
  openingHours: string;
  dateOfEstablishment: string;
  inclusivityTags: string[];
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  providers?: Provider[];
  isCrisis?: boolean;
  timestamp: number;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  message: string;
  providers: Provider[];
  isCrisis: boolean;
}

export interface LLMIntentResult {
  intent:
    | "find_provider"
    | "general_question"
    | "greeting"
    | "clarification_needed"
    | "out_of_scope";
  specializations: string[];
  services: string[];
  region?: string;
  modeOfDelivery?: string;
  modeOfPayment?: string;
  inclusivityPreferences?: string[];
  searchTerms: string[];
  isCrisis: boolean;
}
