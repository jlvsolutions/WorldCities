export interface City {
  id: number;
  name: string;
  lat: number;
  lon: number;
  // TODO:  add population here once migration done
  countryId: number;
  countryName: string;
}
