using System.Text.Json.Serialization;
using WorldCitiesAPI.Data.Entities;

namespace WorldCitiesAPI.Data.Models.Users
{
    public class AuthenticateResponse
    {
        /// <summary>
        /// TRUE if the Login attempt is successful, FALSE otherwise.
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Login attempt result message.
        /// </summary>
        public string Message { get; set; } = null!;

        /// <summary>
        /// The JWT token if the Login attempt is successful, or NULL if not.
        /// </summary>
        public string? Token { get; set; }

        /// <summary>
        /// Refresh token is returned int he http only cookie.
        /// </summary>
        [JsonIgnore]
        public string? RefreshToken { get; set; }

        /// <summary>
        /// User information DTO.
        /// </summary>
        public UserDTO? User { get; set; }

        public AuthenticateResponse()
        {
        }

        public AuthenticateResponse(bool success, string message, string? token = null, string? refreshToken = null, ApplicationUser? user = null, string[]? roles = null)
        {
            Success = success;
            Message = message;
            Token = token;
            RefreshToken = refreshToken;
            if (user != null)
            {
                User = new UserDTO()
                {
                    Id = user.Id,
                    Name = user.DisplayName,
                    Email = user.Email,
                    EmailConfirmed = user.EmailConfirmed,
                    LockoutEnabled = user.LockoutEnabled,
                    Roles = roles!
                };
            }
        }
    }
}
