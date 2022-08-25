namespace WorldCitiesAPI.Data
{
    public class LoginResult : RegisterResult
    {
        /// <summary>
        /// The JWT token if the Login attempt is successful, nor NULL if not
        /// </summary>
        public string? Token { get; set; }

        /// <summary>
        /// The Name associated with the user
        /// </summary>
        public string? Name { get; set; }
    }
}
