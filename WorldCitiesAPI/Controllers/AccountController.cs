using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WorldCitiesAPI.Data;
using WorldCitiesAPI.Data.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace WorldCitiesAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ILogger<AccountController>? _logger;
        private readonly ApplicationDbContext _context;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtHandler _jwtHandler;

        public AccountController(
            ApplicationDbContext context,
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager,
            JwtHandler jwtHandler,
            ILogger<AccountController>? logger)
        {
            _context = context;
            _roleManager = roleManager;
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
                User = new UserDTO()
                {
                    Id = user.Id,
                    Name = user.DisplayName,
                    Email = user.Email,
                    EmailConfirmed = user.EmailConfirmed,
                    LockoutEnabled = user.LockoutEnabled,
                    Roles = (await _userManager.GetRolesAsync(user)).ToArray()
                }
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

        [HttpGet]
        [Authorize(Roles = "Administrator")]
        public async Task<ApiResult<UserDTO>> GetUsers(
            int pageIndex = 0,
            int pageSize = 10,
            string? sortColumn = null,
            string? sortOrder = null,
            string? filterColumn = null,
            string? filterQuery = null)
        {
            _logger?.LogInformation("Entering GetUsers. PageIndex: {pageIndex}, SortOrder: {sortOrder}", pageIndex, sortOrder);

            // TODO:  Figure out how to get Roles populated.
            var source = _context.Users.AsNoTracking()
            .Select(c => new UserDTO()
            {
                Id = c.Id,
                Name = c.DisplayName,
                Email = c.Email,
                EmailConfirmed = c.EmailConfirmed,
                LockoutEnabled = c.LockoutEnabled
            });

            var apiResult = await ApiResult<UserDTO>.CreateAsync(
                source,
                pageIndex,
                pageSize,
                sortColumn,
                sortOrder,
                filterColumn,
                filterQuery);

            ApplicationUser appUser = new ApplicationUser();
            foreach (UserDTO u in apiResult.Data)
            {
                appUser.Id = u.Id;
                u.Roles = (await _userManager.GetRolesAsync(appUser)).ToArray();
            }

            return apiResult;
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<UserDTO>> GetUser(string id)
        {
            if (_context.Users == null)
            {
                return NotFound();
            }
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }
            
            UserDTO resultCity = new UserDTO();

            resultCity.Id = user.Id;
            resultCity.Name = user.DisplayName;
            resultCity.Email = user.Email;
            resultCity.EmailConfirmed = user.EmailConfirmed;
            resultCity.LockoutEnabled = user.LockoutEnabled;
            resultCity.Roles = (await _userManager.GetRolesAsync(user)).ToArray();
            return resultCity;
        }


        [HttpGet("GetRoles")]
        public string[] GetRoles()
        {
            List<string> roles = new List<string>();
            foreach (var role in _context.Roles)
                roles.Add(role.Name);
            return roles.ToArray();
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> PutUser(string id, UserDTO user)
        {
            ApplicationUser appUser;

            _logger?.LogInformation("AccountController: PutUser:  Updating user: {Email}", user.Email);

            if (string.IsNullOrEmpty(id) || user == null || !id.Equals(user.Id))
            {
                return BadRequest();
            }

            appUser = await _userManager.FindByIdAsync(id);
            if (appUser == null)
            {
                return BadRequest();
            }

            // Check for Email/UserName conflict
            ApplicationUser appUserByName = await _userManager.FindByNameAsync(user.Email);
            if (appUserByName != null && appUserByName.Id != appUser.Id)
            {
                return BadRequest("Email/UserName already exists.");
            }

            if (user.Email != appUser.UserName)
                appUser.SecurityStamp = Guid.NewGuid().ToString();
            appUser.DisplayName = user.Name;
            appUser.UserName = user.Email;
            appUser.Email = user.Email;
            appUser.EmailConfirmed = user.EmailConfirmed;
            appUser.LockoutEnabled = user.LockoutEnabled;
            
            // User
            try
            {
                // Perform the user update.
                var updateResult = await _userManager.UpdateAsync(appUser);
                if (!updateResult.Succeeded)
                {
                    _logger?.LogError("AccountController: PutUser:  id:{id}, name:{Name} email: {Email} message: {", id, user.Name, user.Email);
                    foreach (var error in updateResult.Errors)
                    {
                        _logger?.LogError("AccountController: PutUser: ErrorCode: {Code} Description: {Description}",
                            error.Code, error.Description);
                        return Problem("Unable to update user");
                    }
                }

                // Save the user update
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "AccountController: PutUser:  id:{id}, name:{Name} email: {Email}", id, user.Name, user.Email);
                return Problem("Unable to update user");
            }

            // Roles
            try
            {
                // Feature:  If a new role is found in the updated users' Roles,
                // go ahead and add that role in the database.
                // TODO: Add flag that enables/disables this logic.
                if (user.Roles != null && user.Roles.Length > 0)
                    foreach (string role in user.Roles)
                    {
                        if ((await _roleManager.FindByNameAsync(role)) == null)
                            await _roleManager.CreateAsync(new IdentityRole(role));
                        if (!(await _userManager.IsInRoleAsync(appUser, role)))
                            await _userManager.AddToRoleAsync(new ApplicationUser() { Id = user.Id }, role);
                    }

                // Check for any roles that were removed
                var currentRoles = await _userManager.GetRolesAsync(new ApplicationUser() { Id = user.Id });
                if (user.Roles != null)
                    foreach (string role in currentRoles)
                        if (!user.Roles.Contains(role))
                            await _userManager.RemoveFromRoleAsync(new ApplicationUser() { Id = user.Id }, role);

            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "AccountController: PutUser:  id:{id}, name:{Name} email: {Email}", id, user.Name, user.Email);
                return Problem("Unable to update roles for user");
            }

            _context.SaveChanges();
            _logger?.LogInformation("AccountController: PutUser:  Update successful: {Email}", user.Email);
            return Ok("User updated.");
        }

    }
}
