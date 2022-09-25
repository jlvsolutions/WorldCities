using System.ComponentModel.DataAnnotations;

namespace WorldCitiesAPI.Data.Models.Users

{
    public class DupeEmailRequest
    {
        [Required(ErrorMessage = "Email is required.")]
        public string Email { get; set; } = null!;
    }
}
