using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WorldCitiesAPI.Data.Entities
{
    [Table("Cities")]
    [Index(nameof(Name))]
    [Index(nameof(Lat))]
    [Index(nameof(Lon))]
    [Index(nameof(Population))]
    public class City
    {
        #region Properties

        /// <summary>
        /// The unique id and primary key for this City
        /// </summary>
        [Key]
        [Required]
        public int Id { get; set; }

        /// <summary>
        /// City name (in UTF8 format)
        /// </summary>
        public string Name { get; set; } = null!;

        /// <summary>
        /// City Latitude
        /// </summary>
        [Column(TypeName = "decimal(7,4)")]
        public decimal Lat { get; set; }

        /// <summary>
        /// City Longitude
        /// </summary>
        [Column(TypeName = "decimal(7,4)")]
        public decimal Lon { get; set; }

        /// <summary>
        /// City Population
        /// </summary>
        public double Population { get; set; }

        /// <summary>
        /// Country Id (forein key)
        /// </summary>
        [ForeignKey(nameof(Country))]
        public int CountryId { get; set; }
        #endregion

        #region Navigation Properties
        /// <summary>
        /// The country related to this city.
        /// </summary>
        public Country? Country { get; set; } = null!;
        #endregion
    }
}
