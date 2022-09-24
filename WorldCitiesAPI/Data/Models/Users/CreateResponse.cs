namespace WorldCitiesAPI.Data.Models.Users
{
    public class CreateResponse
    {
        /// <summary>
        /// TRUE if the create was successful, FALSE otherwise.
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Create user result message
        /// </summary>
        public string Message { get; set; } = null!;
    }
}
