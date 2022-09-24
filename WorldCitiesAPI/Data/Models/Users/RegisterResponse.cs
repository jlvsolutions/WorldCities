namespace WorldCitiesAPI.Data.Models.Users
{
    public class RegisterResponse
    {
        /// <summary>
        /// True if the user registration attempt is successful, False otherwise.
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Registration attempt's resulting message.
        /// </summary>
        public string Message { get; set; } = null!;
    }
}
