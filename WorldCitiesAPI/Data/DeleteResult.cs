namespace WorldCitiesAPI.Data
{
    public class DeleteResult
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
