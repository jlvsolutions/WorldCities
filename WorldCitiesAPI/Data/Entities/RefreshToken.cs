using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;

namespace WorldCitiesAPI.Data.Entities
{
    [Table("RefreshTokens")]
    public class RefreshToken
    {
        [Key]
        [JsonIgnore]
        public int Id { get; set; }
        public string Token { get; set; } = null!;
        public DateTime Expires { get; set; }
        public DateTime Created { get; set; }
        public string CreatedByIp { get; set; } = null!;
        public DateTime? Revoked { get; set; }
        public string? RevokedByIp { get; set; } = null!;
        public string? ReplacedByToken { get; set; } = null!;
        public string? ReasonRevoked { get; set; }

        /// <summary>
        /// Returns:  DateTime.UtcNow >= Expires
        /// </summary>
        public bool IsExpired => DateTime.UtcNow >= Expires;

        /// <summary>
        /// Returns:  Revoked != null
        /// </summary>
        public bool IsRevoked => Revoked != null;

        /// <summary>
        /// Returns:  !IsRevoked &amp;&amp; !IsExpired
        /// </summary>
        public bool IsActive => !IsRevoked && !IsExpired;

        /// <summary>
        /// ApplicationUser Id (forein key)
        /// </summary>
        [ForeignKey(nameof(ApplicationUser))]
        public string UserId { get; set; } = null!;

        #region Navigation Properties
        /// <summary>
        /// The ApplicationUser related to this RefreshToken.
        /// </summary>
        public virtual ApplicationUser? User { get; set; } = null!;
        #endregion

    }
}
