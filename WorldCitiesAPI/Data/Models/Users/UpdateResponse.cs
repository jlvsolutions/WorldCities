namespace WorldCitiesAPI.Data.Models.Users
{
    public class UpdateResponse
    {
        /// <summary>
        /// True if the user update attempt is successful, False otherwise.
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// User update attempt's resulting message.
        /// </summary>
        public string Message { get; set; } = null!;
    }
}
