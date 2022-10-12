using System.ComponentModel.DataAnnotations;

namespace WorldCitiesAPI.Data.Models.Users
{
    public class RevokeTokenRequest
    {
        public string? Token { get; set; } = null;
    }
}
