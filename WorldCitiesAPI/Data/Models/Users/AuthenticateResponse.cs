using System.Text.Json.Serialization;
using WorldCitiesAPI.Data.Entities;

namespace WorldCitiesAPI.Data.Models.Users
{
    public class AuthenticateResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = null!;
        public UserDTO User { get; set; } = null!;

        public AuthenticateResponse() { }
    }
}
