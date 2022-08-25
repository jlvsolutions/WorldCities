namespace WorldCitiesAPI.Data
{
    /// <summary>
    /// Data Transfer Object for Users 
    /// (currently only has email property)
    /// </summary>
    public class UserDTO
    {
        public string Email { get; set; } = null!;
    }
}
