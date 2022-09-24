using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using WorldCitiesAPI.Data.Entities;

namespace WorldCitiesAPI.Data
{
    public class JwtHandler
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<JwtHandler> _logger;
        private readonly ApplicationDbContext _context;

        public JwtHandler(IConfiguration configuration, UserManager<ApplicationUser> userManager, ILogger<JwtHandler> logger, ApplicationDbContext context)
        {
            _configuration = configuration;
            _userManager = userManager;
            _logger = logger;
            _context = context;
        }

        /// <summary>
        /// Generates a new JWT token for the given user.
        /// </summary>
        /// <param name="user"></param>
        /// <returns>The newly created JWT token.</returns>
        public async Task<JwtSecurityToken> GenerateJwtToken(ApplicationUser user)
        {
            var jwtOptions = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: await GetClaimsAsync(user),
                expires: DateTime.Now.AddMinutes(Convert.ToDouble(
                    _configuration["JwtSettings:ExpirationTimeoutInMinutes"])),
                signingCredentials: GetSigningCredentials());

            _logger.LogInformation("GenerateJwtToken: UserName: {UserName} Email: {Email}", user.UserName, user.Email);

            return jwtOptions;
        }

        private SigningCredentials GetSigningCredentials()
        {
            var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecurityKey"]);
            var secret = new SymmetricSecurityKey(key);

            return new SigningCredentials(secret, SecurityAlgorithms.HmacSha256);
        }

        private async Task<List<Claim>> GetClaimsAsync(ApplicationUser user)
        {
            var claims = new List<Claim>()
            {
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.Email, user.Email)
            };

            foreach(var role in await _userManager.GetRolesAsync(user))
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }
            return claims;
        }

        /// <summary>
        /// Generates a new refresh token using the given IP Address.
        /// </summary>
        /// <param name="ipAddress"></param>
        /// <returns>The newly created refresh token.</returns>
        public RefreshToken GenerateRefreshToken(string ipAddress)
        {
            return new RefreshToken() 
            { 
                Token = setUniqueToken(),
                Expires = DateTime.UtcNow.AddDays(7),  // Token is valid for 7 days.
                Created = DateTime.UtcNow,
                CreatedByIp = ipAddress
            };
        }
        
        private string setUniqueToken()
        {
            // Token is a cryptographically strong random sequence of values
            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

            // Ensure token is unique by checking against the database
            var tokenIsUnique = !_context.UserTokens.Any(t => t.Value == token);

            if (!tokenIsUnique)
                return setUniqueToken();

            return token;
        }
    }
}
