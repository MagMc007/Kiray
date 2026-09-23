import type { Amenity, PropertyType } from '@/types/listing';

export const ADDIS_NEIGHBORHOODS = [
  'All Neighborhoods',
  'Bole',
  'Kazanchis',
  'Old Airport',
  'CMC',
  'Sarbet',
  'Piassa',
  'Ayat',
  'Gerji',
  'Meskel Flower',
  'Gotera',
] as const;

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House / Townhouse' },
  { value: 'studio', label: 'Studio Apartment' },
  { value: 'room', label: 'Single Room' },
  { value: 'villa', label: 'Luxury Villa' },
  { value: 'condo', label: 'Condominium' },
  { value: 'other', label: 'Other Property' },
];

export const AMENITIES: Amenity[] = [
  'wifi',
  'parking',
  'ac',
  'heating',
  'furnished',
  'unfurnished',
  'washer',
  'dryer',
  'balcony',
  'garden',
  'pool',
  'gym',
  'pet_friendly',
  'security',
  'elevator',
  'water_included',
  'electricity_included',
  'gas_included',
];

export const AMENITY_LABELS: Record<Amenity, { label: string; iconName: string }> = {
  wifi: { label: 'High-Speed Wi-Fi', iconName: 'Wifi' },
  parking: { label: 'Dedicated Parking', iconName: 'Car' },
  ac: { label: 'Air Conditioning', iconName: 'Wind' },
  heating: { label: 'Heating', iconName: 'Flame' },
  furnished: { label: 'Fully Furnished', iconName: 'Armchair' },
  unfurnished: { label: 'Unfurnished', iconName: 'Box' },
  washer: { label: 'Washing Machine', iconName: 'WashingMachine' },
  dryer: { label: 'Dryer', iconName: 'Sun' },
  balcony: { label: 'Private Balcony', iconName: 'Compass' },
  garden: { label: 'Green Garden', iconName: 'Trees' },
  pool: { label: 'Swimming Pool', iconName: 'Waves' },
  gym: { label: 'Fitness Center / Gym', iconName: 'Dumbbell' },
  pet_friendly: { label: 'Pet Friendly', iconName: 'PawPrint' },
  security: { label: '24/7 Guarded Security', iconName: 'ShieldCheck' },
  elevator: { label: 'Elevator / Lift', iconName: 'ArrowUpDown' },
  water_included: { label: 'Water Reserve / Included', iconName: 'Droplets' },
  electricity_included: { label: 'Electricity Included', iconName: 'Zap' },
  gas_included: { label: 'Gas Supply', iconName: 'Flame' },
};

export const MAP_DEFAULTS = {
  ADDIS_COORDINATES: [38.7578, 8.9806] as [number, number], // [lng, lat]
  DEFAULT_ZOOM: 12,
  BOUNDS_RADIUS_METERS: 15000,
};
