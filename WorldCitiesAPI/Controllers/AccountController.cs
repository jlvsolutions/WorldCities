using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WorldCitiesAPI.Data;
using WorldCitiesAPI.Data.Models;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

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
                Token = jwt,
                Name = user.DisplayName
            });
        }

        [HttpPost("Register")]
        public async Task<IActionResult> PostUser(RegisterRequest registerRequest)
        {
            _logger?.LogInformation("AccountController: PostAccout Name:{Name} Email:{Email}", registerRequest.Name, registerRequest.Email);

            if (_context.Users == null)
            {
                _logger?.LogWarning("AccountController: 'ApplicationDbContext.Users' is null");
                return Problem("Entity set 'ApplicationDbContext.Users' is null.");
            }

            if (string.IsNullOrEmpty(registerRequest.Email))
            {
                var msg = "Email is required.";
                _logger?.LogInformation("AccountController:  {msg}", msg);
                return BadRequest(msg);
            }

            if (string.IsNullOrEmpty(registerRequest.Password))
            {
                var msg = "Password is required.";
                _logger?.LogInformation("AccountController:  {msg}", msg);
                return BadRequest(msg);
            }

            if (string.IsNullOrEmpty(registerRequest.Name))
            {
                var msg = "User name is required.";
                _logger?.LogInformation("AccountController:  {msg}", msg);
                return BadRequest(msg);
            }

            if (await _userManager.FindByNameAsync(registerRequest.Email) != null)
            {
                _logger?.LogInformation("AccountController: User with Email {Email} already exists.", registerRequest.Email);
                return BadRequest($"User with Email {registerRequest.Email} already exists.");
            }

            // setup the default role names
            string role_RegisteredUser = "RegisteredUser";

            // create a new standard ApplicationUser account
            var user_User = new ApplicationUser()
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = registerRequest.Email,
                Email = registerRequest.Email,
                DisplayName = registerRequest.Name
            };

            try
            {
                // insert the standard user into the DB
                await _userManager.CreateAsync(user_User, registerRequest.Password);

                // assign the "RegisteredUser" role
                await _userManager.AddToRoleAsync(user_User, role_RegisteredUser);

                // confirm the e-mail and remove Lockout
                user_User.EmailConfirmed = true;             // TODO: Don't forget to implement 2 factor authentication!!!
                user_User.LockoutEnabled = false;

                await _context.SaveChangesAsync();

                _logger?.LogInformation("AccountController: User with Email {Email} created.", registerRequest.Email);
                return Ok(new RegisterResult()
                {
                    Success = true,
                    Message = "Registration successful",
                });
            } catch (Exception ex)
            {
                string msg = ex.Message;
                _logger?.LogInformation("AccountController: PostUser: Error: {msg}", msg);
                return BadRequest("Invalid email or password.");
            }

        }

        [HttpPost]
        [Route("IsDupeEmail")]
        public bool IsDupeEmail(UserDTO user)
        {
            _logger?.LogInformation("AccountController: IsDupeEmail Email:{email}", user.Email);

            if (user == null)
                return false;

            if (string.IsNullOrEmpty(user.Email))
                return false;

            var appUser = _context.Users
                .Where(e => e.UserName == user.Email)
                .FirstOrDefault();

            return appUser != null;

        }
    }
}
