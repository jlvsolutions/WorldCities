export interface City {
  id: number;
  name: string;
  lat: number;
  lon: number;
  population: number;
  capital?: string;
  adminRegionId?: number;
  adminRegionName?: string;
  countryId: number;
  countryName: string;
}
