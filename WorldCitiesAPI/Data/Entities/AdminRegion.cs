using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace WorldCitiesAPI.Data.Entities
{
    [Table("AdminRegions")]
    [Index(nameof(Name))]
    [Index(nameof(Code))]
    public class AdminRegion
    {
        #region Properties
        /// <summary>
        /// The unique id and primary key for this Administration Region
        /// </summary>
        [Key]
        [Required]
        public int Id { get; set; }

        /// <summary>
        /// Administration region name
        /// </summary>
        public string Name { get; set; } = null!;

        /// <summary>
        /// Standardized code to identify this region, state, province, etc.
        /// </summary>
        public string? Code { get; set; } = null!;

        /// <summary>
        /// Country Id (forein key)
        /// </summary>
        [ForeignKey(nameof(Country))]
        public int CountryId { get; set; }
        #endregion

        #region Navigation Properties
        /// <summary>
        /// A list containing all the cities related to this administration region.
        /// </summary>
        [JsonIgnore]
        public ICollection<City>? Cities { get; set; } = null;

        /// <summary>
        /// The country related to this administration region.
        /// </summary>
        public Country? Country { get; set; } = null!;
        #endregion

    }
}
