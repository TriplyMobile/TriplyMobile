export interface Trip {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  countryDestination?: string;
  maxBudget?: number;
  currency?: string;
  description?: string;
}

export interface TripFormData {
  name: string;
  startDate?: string;
  endDate?: string;
  countryDestination?: string;
  maxBudget?: string; // String for form input, converted to number
  currency?: string;
  description?: string;
}
