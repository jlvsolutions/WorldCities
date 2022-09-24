using System.ComponentModel.DataAnnotations;

namespace WorldCitiesAPI.Data.Models.Users
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "Email is required.")]
        public string Email { get; set; } = null!;
        
        [Required(ErrorMessage = "Password is required.")]
        public string Password { get; set; } = null!;
    }
}
