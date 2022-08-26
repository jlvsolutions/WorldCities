namespace WorldCitiesAPI.Data
{
    /// <summary>
    /// Data Transfer Object for Users 
    /// </summary>
    public class UserDTO
    {
        /// <summary>
        /// Unique Id identifying this user.
        /// </summary>
        public string Id { get; set; } = null!;

        /// <summary>
        /// Friendly display name for the user.
        /// </summary>
        public string Name { get; set; } = null!;

        /// <summary>
        /// Email address associated with the user.
        /// </summary>
        public string Email { get; set; } = null!;

        /// <summary>
        /// Indicates if the user has confirmed their email address.
        /// </summary>
        public bool EmailConfirmed { get; set; }

        /// <summary>
        /// Indicates if the user could be locked out.
        /// </summary>
        public bool LockoutEnabled { get; set; }

        /// <summary>
        /// List of roles this user has.
        /// </summary>
        public string[] Roles { get; set; } = null!;
    }
}
