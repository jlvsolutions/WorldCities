using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WorldCitiesAPI.Data;
using WorldCitiesAPI.Data.Models;
using Microsoft.Extensions.Logging;

namespace WorldCitiesAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ILogger<AccountController>? _logger;
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtHandler _jwtHandler;

        public AccountController(
            ApplicationDbContext context, 
            UserManager<ApplicationUser> userManager, 
            JwtHandler jwtHandler, 
            ILogger<AccountController>? logger)
        {
            _context = context;
            _userManager = userManager;
            _jwtHandler = jwtHandler;
            _logger = logger;
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login(LoginRequest loginRequest)
        {
            var user = await _userManager.FindByNameAsync(loginRequest.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginRequest.Password))
            {
                _logger?.LogInformation("AccountController: Login Failed:  Invalid Email or Password. Login: {Email}", loginRequest.Email);

                return Unauthorized(new LoginResult() { 
                    Success = false,
                    Message = "Invalid Email or Password."
                });
            }

            var secToken = await _jwtHandler.GetTokenAsync(user);
            var jwt = new JwtSecurityTokenHandler().WriteToken(secToken);

            _logger?.LogInformation("AccountController: Login Successful. Login: {Email}", loginRequest.Email);

            return Ok(new LoginResult()
            {
                Success = true,
                Message = "Login successful",
                Token = jwt
            });
        }
    }
}
