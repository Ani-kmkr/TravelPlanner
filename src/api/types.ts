export type TripPlace = {
  tripPlaceId: number;
  placeId: number;
  name: string;
  category: string;
  dayNumber: number;
  visitOrder: number;
  plannedStartTime: string | null;
  plannedDurationMinutes: number | null;
  notes: string | null;
};

export type Trip = {
  id: number;
  name: string;
  destinationCityId: number;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  places: TripPlace[];
};


export type TripSummary = {
  id: number;
  name: string;
  destinationCityId: number;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  placeCount: number;
};
