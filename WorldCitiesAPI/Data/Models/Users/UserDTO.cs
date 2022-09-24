using System.Text.Json.Serialization;
using WorldCitiesAPI.Data.Entities;

namespace WorldCitiesAPI.Data.Models.Users
{
    /// <summary>
    /// Data Transfer Object for Users 
    /// </summary>
    public class UserDTO
    {
        /// <summary>
        /// Unique Id identifying this user.
        /// </summary>
        public string Id { get; set; } = null!;

        /// <summary>
        /// Friendly Display Name for the user.
        /// </summary>
        public string Name { get; set; } = null!;

        /// <summary>
        /// Email address associated with the user.
        /// </summary>
        public string Email { get; set; } = null!;

        /// <summary>
        /// Indicates if the user has confirmed their email address.
        /// </summary>
        public bool EmailConfirmed { get; set; }

        /// <summary>
        /// Indicates if the user could be locked out.
        /// </summary>
        public bool LockoutEnabled { get; set; }

        /// <summary>
        /// For Administrator to set a new password.
        /// </summary>
        public string NewPassword { get; set; } = null!;

        /// <summary>
        /// List of roles this user has.
        /// </summary>
        public string[] Roles { get; set; } = null!;

        [JsonIgnore]
        public List<RefreshToken> RefreshTokens { get; set; } = null!;


        public UserDTO() { }

        public UserDTO(ApplicationUser user, string[] roles)
        {
            Id = user.Id;
            Name = user.DisplayName;
            Email = user.Email;
            EmailConfirmed = user.EmailConfirmed;
            LockoutEnabled = user.LockoutEnabled;
            Roles = roles;
            RefreshTokens = user.RefreshTokens;
        }
    }
}
