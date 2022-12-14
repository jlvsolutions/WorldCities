namespace WorldCitiesAPI.Data.Models.Cities
{
    public class CityDTO
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;

        public decimal Lat { get; set; }

        public decimal Lon { get; set; }

        public double Population { get; set; }

        public string? Capital { get; set; }

        public int? AdminRegionId { get; set; }

        public string? AdminRegionName { get; set; } = null!;

        public int CountryId { get; set; }

        public string? CountryName { get; set; } = null;

    }
}
