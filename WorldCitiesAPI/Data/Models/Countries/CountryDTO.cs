using System.Text.Json.Serialization;

namespace WorldCitiesAPI.Data.Models.Countries
{
    public class CountryDTO
    {
        #region Properties
        public int Id { get; set; }

        public string Name { get; set; } = null!;

        [JsonPropertyName("iso2")]
        [GraphQLName("iso2")]
        public string ISO2 { get; set; } = null!;

        [JsonPropertyName("iso3")]
        [GraphQLName("iso3")]
        public string ISO3 { get; set; } = null!;

        public int? CapitalId { get; set; }

        public string? CapitalName { get; set; } = null!;

        public int? TotAdminRegions { get; set; } = null!;

        public int? TotCities { get; set; } = null!;

        #endregion
    }
}
