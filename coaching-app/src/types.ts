export interface Coach {
  id: number;
  name: string;
  specialty: string;
  diplomas: string[];
  photoUrl: string;
  description: string;
  rating: number;
}

export interface Testimonial {
  id: number;
  name: string;
  quote: string;
  result: string;
  photoUrl: string;
  age: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  description: string;
  features: string[];
  highlighted: boolean;
}

export interface SiteStats {
  members: number;
  averageRating: number;
  satisfaction: number;
}

export interface HomePageData {
  hero: {
    badge: string;
    title: string;
    highlight: string;
    description: string;
    imageUrl: string;
  };
  services: {
    id: string;
    icon: string;
    title: string;
    description: string;
  }[];
  coaches: Coach[];
  testimonials: Testimonial[];
  plans: PricingPlan[];
  stats: SiteStats;
}

export interface MessageResponse {
  message: string;
}