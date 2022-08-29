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
        public async Task<IActionResult> Register(RegisterRequest registerRequest)
        {
            _logger?.LogInformation("AccountController: Register Name:{Name} Email:{Email}", registerRequest.Name, registerRequest.Email);

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
            var appUser = new ApplicationUser()
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = registerRequest.Email,
                Email = registerRequest.Email,
                DisplayName = registerRequest.Name
            };

            try
            {
                // insert the regular RegisteredUser into the DB
                await _userManager.CreateAsync(appUser, registerRequest.Password);

                // assign the "RegisteredUser" role
                await _userManager.AddToRoleAsync(appUser, role_RegisteredUser);

                // confirm the e-mail and remove Lockout
                appUser.EmailConfirmed = true;             // TODO: Don't forget to implement 2 factor authentication!!!
                appUser.LockoutEnabled = false;

                await _context.SaveChangesAsync();

                string msg = $"User {appUser.DisplayName}, {appUser.Email} created successfully";
                _logger?.LogInformation("AccountController: Register: {msg}", msg);

                return Ok(new RegisterResult()
                {
                    Success = true,
                    Message = msg
                });
            }
            catch (Exception ex)
            {
                string msg = ex.Message;
                _logger?.LogInformation("AccountController: PostUser: Error: {msg}", msg);
                return BadRequest("Invalid email or password.");
            }

        }

        [HttpPost()]
        [Authorize(Roles = "Administrator")]
        //[ValidateAntiForgeryToken] check this out later.
        public async Task<IActionResult> PostUser(UserDTO user)
        {

            // setup the default role name
            string role_RegisteredUser = "RegisteredUser";

            _logger?.LogInformation("AccountController: PostUser Name:{Name} Email:{Email}", user.Name, user.Email);

            if (_context.Users == null)
            {
                _logger?.LogWarning("AccountController: 'ApplicationDbContext.Users' is null");
                return Problem("Entity set 'ApplicationDbContext.Users' is null.");
            }

            if (string.IsNullOrEmpty(user.Email))
            {
                var msg = "Email is required.";
                _logger?.LogInformation("AccountController:  {msg}", msg);
                return BadRequest(msg);
            }

            if (string.IsNullOrEmpty(user.NewPassword))
            {
                var msg = "Password is required.";
                _logger?.LogInformation("AccountController:  {msg}", msg);
                return BadRequest(msg);
            }

            if (string.IsNullOrEmpty(user.Name))
            {
                var msg = "User name is required.";
                _logger?.LogInformation("AccountController:  {msg}", msg);
                return BadRequest(msg);
            }

            if (user.Roles == null || user.Roles.Length == 0)
            {
                user.Roles = new string[] { role_RegisteredUser };
            }

            if (await _userManager.FindByNameAsync(user.Email) != null)
            {
                _logger?.LogInformation("AccountController: User with Email {Email} already exists.", user.Email);
                return BadRequest($"User with Email {user.Email} already exists.");
            }

            // create a new standard ApplicationUser account
            var appUser = new ApplicationUser()
            {
                UserName = user.Email,
                Email = user.Email,
                DisplayName = user.Name,
                EmailConfirmed = user.EmailConfirmed,             // TODO: Don't forget to implement 2 factor authentication!!!
                LockoutEnabled = user.LockoutEnabled
             };

            try
            {
                // insert the application user into the DB
                await _userManager.CreateAsync(appUser, user.NewPassword);
                await _context.SaveChangesAsync();

                // Feature:  If a new role is found in the updated users' Roles,
                // go ahead and add that role in the database.
                // TODO: Add flag that enables/disables this logic.
                foreach (string role in user.Roles)
                {
                    if ((await _roleManager.FindByNameAsync(role)) == null)
                        await _roleManager.CreateAsync(new IdentityRole(role));
                    if (!(await _userManager.IsInRoleAsync(appUser, role)))
                        await _userManager.AddToRoleAsync(appUser, role);
                }

                await _context.SaveChangesAsync();

                string msg = $"User {appUser.DisplayName}, {appUser.Email} created successfully";
                _logger?.LogInformation("AccountController: PostUser: {msg}", msg);

                return Ok(new RegisterResult()
                {
                    Success = true,
                    Message = msg
                });
            }
            catch (Exception ex)
            {
                string msg = ex.Message;
                _logger?.LogInformation("AccountController: PostUser: Error: {msg}", msg);
                return BadRequest("Error adding to/creating user roles."); // this text is wrong...
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
                .Where(e => (e.UserName == user.Email) 
                         && (e.Id != user.Id))
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

            //Password
            try
            {

                if (!string.IsNullOrEmpty(user.NewPassword))
                {
                    _logger?.LogInformation("AccountController: PutUser: Changing password for {email}", appUser.Email);
                    await _userManager.RemovePasswordAsync(appUser);
                    await _userManager.AddPasswordAsync(appUser, user.NewPassword);
                }
            }
            catch(Exception ex)
            {
                _logger?.LogError(ex, "AccountController: PutUser:  id:{id}, name:{Name} email: {Email}", id, user.Name, user.Email);
                return Problem("Unable to update password for user");
            }

            //Save Changes
            try
            {

                _context.SaveChanges();
                _logger?.LogInformation("AccountController: PutUser:  Update successful: {Email}", user.Email);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "AccountController: PutUser:  id:{id}, name:{Name} email: {Email}", id, user.Name, user.Email);
                return Problem("Unable to save changes for user");
            }
            return Ok(new UserResult()
            {
                Success = true,
                Message = "Update successful",
            });
        }

        [HttpPost("Delete")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Delete(UserDTO user)
        {
            if (_context.Users == null)
            {
                return NotFound();
            }

            if (user == null)
            { 
                return BadRequest("Invalid User");
            }

            if (string.IsNullOrEmpty(user.Id))
            {
                return BadRequest("Invalid user id");
            }

            ApplicationUser appUser = await _userManager.FindByIdAsync(user.Id);

            if (appUser == null)
            {
                return NotFound($"User {user.Name} with id {user.Id} not found.");
            }

            // Delete
            try
            {
                await _userManager.DeleteAsync(appUser);
                _context.SaveChanges();

                return Ok(new DeleteResult()
                {
                    Success = true,
                    Message = $"Successfully delete {appUser.Email}."
                });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error deleting user id {id}.", user.Id);
                return Problem($"Error deleting user id {appUser.Email}");
            }

        }
    }
}
