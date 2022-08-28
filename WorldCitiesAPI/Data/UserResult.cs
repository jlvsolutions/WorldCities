namespace WorldCitiesAPI.Data
{
    public class UserResult
    {
        /// <summary>
        /// TRUE if the update/create attempt is successful, FALSE otherwise.
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Update/create attempt result message
        /// </summary>
        public string Message { get; set; } = null!;
    }
}
