using Microsoft.AspNetCore.Identity;
using System.Text.Json.Serialization;

namespace WorldCitiesAPI.Data.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public string DisplayName { get; set; } = null!;

        #region Navigtation Properties
        [JsonIgnore]
        public List<RefreshToken> RefreshTokens { get; set; } = null!;
        #endregion
    }
}
