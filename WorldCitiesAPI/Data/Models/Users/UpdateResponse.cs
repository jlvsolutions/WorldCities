namespace WorldCitiesAPI.Data.Models.Users
{
    public class UpdateResponse
    {
        /// <summary>
        /// True if the user update attempt is successful, False otherwise.
        /// </summary>
        public bool Success { get; set; }
        private bool _notFound;
        public bool NotFound 
        {
            get => _notFound;

            set
            {
                _notFound = value;
                if (_notFound)
                    Success = false;
            } 
        }
        private bool _conflict;
        public bool Conflict 
        {
            get => _conflict;
            set
            {
                _conflict = value;
                if (_conflict)
                    Success = false;
            }
        }
        private bool _unauthorized;
        public bool Unauthorized 
        {
            get => _unauthorized;
            set
            {
                _unauthorized = value;
                if (_unauthorized)
                    Success = false;
            }
        }

        /// <summary>
        /// User update attempt's resulting message.
        /// </summary>
        public string Message { get; set; } = null!;
    }
}
