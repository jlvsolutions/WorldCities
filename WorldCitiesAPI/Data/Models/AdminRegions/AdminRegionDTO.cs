namespace WorldCitiesAPI.Data.Models.AdminRegions
{
    public class AdminRegionDTO
    {
        #region Properties
        public int Id { get; set; }

        public string Name { get; set; } = null!;
        
        public string? Code { get; set; } = null!;

        public int? TotCities { get; set; } = null!;

        public int? CapitalId { get; set; }

        public string? CapitalName { get; set; } = null;

        public int CountryId { get; set; }

        public string? CountryName { get; set; } = null;

        #endregion
    }
}
