using System.Text.Json.Serialization;
using WorldCitiesAPI.Data.Entities;

namespace WorldCitiesAPI.Data.Models.Users
{
    public class AuthenticateResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = null!;
        public string? JwtToken { get; set; }
        [JsonIgnore]
        public string? RefreshToken { get; set; }
        public UserDTO? User { get; set; }

        public AuthenticateResponse(bool success, string message, string? jwtToken = null, string? refreshToken = null, ApplicationUser? user = null, string[]? roles = null)
        {
            Success = success;
            Message = message;
            JwtToken = jwtToken;
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
