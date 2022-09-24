using System.ComponentModel.DataAnnotations;

namespace WorldCitiesAPI.Data.Models.Users
{
    public class RevokeTokenRequest
    {
        [Required(ErrorMessage = "Token is required.")]
        public string Token { get; set; } = null!;
    }
}
