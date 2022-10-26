﻿using System.Text.Json.Serialization;
using WorldCitiesAPI.Data.Entities;

namespace WorldCitiesAPI.Data.Models.Users
{
    /// <summary>
    /// Data Transfer Object for Users 
    /// </summary>
    public class UserDTO
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public bool EmailConfirmed { get; set; }
        public bool LockoutEnabled { get; set; }
        public string NewPassword { get; set; } = null!;
        public string[] Roles { get; set; } = null!;
        public string JwtToken { get; set; } = null!;

        [JsonIgnore] // refresh token is returned in http only cookie
        public string RefreshToken { get; set; } = null!;

        public UserDTO() { }
    }
}
