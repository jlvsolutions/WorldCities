using Microsoft.AspNetCore.Identity;

namespace WorldCitiesAPI.Data.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string DisplayName { get; set; } = null!;
    }
}
