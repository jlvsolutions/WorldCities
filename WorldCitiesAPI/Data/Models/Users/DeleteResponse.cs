namespace WorldCitiesAPI.Data.Models.Users
{
    public class DeleteResponse
    {
        /// <summary>
        /// TRUE if the delete was successful, FALSE otherwise.
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Delete user result message
        /// </summary>
        public string Message { get; set; } = null!;
    }
}
