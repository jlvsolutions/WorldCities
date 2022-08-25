using System.ComponentModel.DataAnnotations;

namespace WorldCitiesAPI.Data
{
    public class RegisterRequest : LoginRequest
    {
        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; } = null!;
    }
}
