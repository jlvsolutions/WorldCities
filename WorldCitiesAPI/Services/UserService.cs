//using BCrypt.Net;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WorldCitiesAPI.Data;
using WorldCitiesAPI.Data.Models.Users;
using WorldCitiesAPI.Data.Entities;

namespace WorldCitiesAPI.Services
{
    public interface IUserService
    {
        Task<AuthenticateResponse> Login(AuthenticateRequest model, string ipAddress);
        Task<RegisterResponse> Register(RegisterRequest model);
        Task<CreateResponse> Create(UserDTO user);
        Task<UpdateResponse> Update(string id, UserDTO user);
        Task<DeleteResponse> Delete(string id);
        Task<AuthenticateResponse> RefreshToken(string token, string ipAddress);
        string? RevokeToken(string token, string ipAddress);
        Task<IQueryable<UserDTO>> GetAll();
        Task<UserDTO> GetById(string id);
        Task<bool> IsDupeEmail(string email);
        string[] GetRoles();
    }

    public class UserService : IUserService
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtHandler _jwtHandler;
        private readonly ILogger<UserService> _logger;

        public UserService(
            IConfiguration configuration,
            ApplicationDbContext context, 
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager,
            JwtHandler jwtHandler,
            ILogger<UserService> logger)
        {
            _configuration = configuration;
            _context = context;
            _roleManager = roleManager;
            _userManager = userManager;
            _jwtHandler = jwtHandler;
            _logger = logger;
        }

        public async Task<AuthenticateResponse> Login(AuthenticateRequest model, string ipAddress)
        {
            // Validate
            var user = await _userManager.FindByNameAsync(model.Email);

            if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
            {
                _logger.LogInformation("Authenticate: Authentication failed:  Invalid Email or Password. Login: {Email}", model.Email);
                return new AuthenticateResponse(false, "Invalid Email or Password");
            }
            var roles = (await _userManager.GetRolesAsync(user)).ToArray();

            // Authentication successful, so generate jwt and refresh tokens.
            var secToken = await _jwtHandler.GenerateJwtToken(user);
            var jwt = new JwtSecurityTokenHandler().WriteToken(secToken);
            var refreshToken = _jwtHandler.GenerateRefreshToken(ipAddress);
            if (user.RefreshTokens == null)
                user.RefreshTokens = new List<RefreshToken>();
            user.RefreshTokens.Add(refreshToken);

            // Remove old refresh tokens from user.
            removeOldRefreshTokens(user);

            // Save changes to the DB.
            _context.Update(user);
            _context.SaveChanges();

            return new AuthenticateResponse(true, "Authentication Success", jwt, refreshToken.Token, user, roles);
        }

        public async Task<RegisterResponse> Register(RegisterRequest model)
        {
            // Ensure user does not already exists.
            if (await _userManager.FindByNameAsync(model.Email) != null)
            {
                _logger.LogInformation("Register:  Registration failed:  User Email already exists.  Email: {Email}", model.Email);
                return new RegisterResponse() { Success = false, Message = "Registration failed.  User Email already exists." };
            }

            // Setup the default role names
            string role_RegisteredUser = "RegisteredUser";

            // Create a new standard ApplicationUser account
            var appUser = new ApplicationUser()
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Email,
                Email = model.Email,
                DisplayName = model.Name
            };

            // Insert the new RegisteredUser into the DB
            await _userManager.CreateAsync(appUser, model.Password);

            // Assign the "RegisteredUser" role
            await _userManager.AddToRoleAsync(appUser, role_RegisteredUser);

            // Force Confirm the e-mail and Remove Lockout.
            appUser.EmailConfirmed = true;
            appUser.LockoutEnabled = false;

            await _context.SaveChangesAsync();

            return new RegisterResponse() { Success = true, Message = "Registration was successful." };
        }

        public async Task<CreateResponse> Create(UserDTO user)
        {
            // Setup the default role name
            string role_RegisteredUser = "RegisteredUser";
            if (user.Roles == null || user.Roles.Length == 0)
            {
                user.Roles = new string[] { role_RegisteredUser };
            }

            if (await _userManager.FindByNameAsync(user.Email) != null)
            {
                _logger.LogWarning("Create: User with Email {Email} already exists.", user.Email);
                return new CreateResponse() { Success = false, Message = $"User with Email {user.Email} already exists." };
            }

            // Create a new standard ApplicationUser account
            var appUser = new ApplicationUser()
            {
                UserName = user.Email,
                Email = user.Email,
                DisplayName = user.Name,
                EmailConfirmed = user.EmailConfirmed,
                LockoutEnabled = user.LockoutEnabled
            };

            try
            {
                // Insert the application user into the DB
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

                string msg = $"User {appUser.DisplayName}, {appUser.Email} created successfully.";
                _logger.LogInformation("Create: {msg}", msg);

                return new CreateResponse() { Success = true, Message = msg };
            }
            catch (Exception ex)
            {
                string msg = ex.Message;
                _logger.LogError(ex, "Create: Error: {msg}", msg);
                return new CreateResponse() { Success = false, Message = "Error adding to/creating user." };
            }
        }

        public async Task<UpdateResponse> Update(string id, UserDTO user)
        {
            var appUser = await _userManager.FindByIdAsync(id);

            if (appUser == null)
            {
                _logger.LogWarning("Update: User Id not found: {id}.", id);
                return new UpdateResponse() { Success = false,  Message = "User Id not found." };
            }

            // Check for Email/UserName conflict
            ApplicationUser appUserByName = await _userManager.FindByNameAsync(user.Email);
            if (appUserByName != null && appUserByName.Id != appUser.Id)
            {
                _logger.LogWarning("Update: Email/UserName already exists: {Email}", user.Email);
                return new UpdateResponse() { Success = false, Message = "Email/UserName already exists." };
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
                    _logger.LogError("Update: UpdateAsync failed. id:{id}, name:{Name} email: {Email} message: {", id, user.Name, user.Email);
                    foreach (var error in updateResult.Errors)
                        _logger.LogError("Update: ErrorCode: {Code} Description: {Description}", error.Code, error.Description);
                    return new UpdateResponse() { Success = false, Message = "Unable to update user." };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Update:  Exception occurred performing user update. id:{id}, name:{Name} email: {Email}", id, user.Name, user.Email);
                return new UpdateResponse() { Success = false, Message = "Unable to update user." };
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
                _logger.LogError(ex, "Update: Exception occurred updating user roles. id:{id}, name:{Name} email: {Email}", id, user.Name, user.Email);
                return new UpdateResponse() { Success = false, Message = "Unable to update roles for user." };
            }

            //Password
            try
            {

                if (!string.IsNullOrEmpty(user.NewPassword))
                {
                    _logger.LogDebug("Update: Changing password for {email}", appUser.Email);
                    await _userManager.RemovePasswordAsync(appUser);
                    await _userManager.AddPasswordAsync(appUser, user.NewPassword);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Update:  Exception occurred changing password. id:{id}, name:{Name} email: {Email}", id, user.Name, user.Email);
                return new UpdateResponse() { Success = false, Message = "Unable to update password for user." };
            }

            //Save Changes
            try
            {
                _context.SaveChanges();
                _logger.LogInformation("Update:  User update successful: {Email}", user.Email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Update: Exception occurred saving changes. id:{id}, name:{Name} email: {Email}", id, user.Name, user.Email);
                return new UpdateResponse() { Success = false, Message = "Unable to save changes for user." };
            }
            return new UpdateResponse() { Success = true, Message = "Update successful." };
        }

        public async Task<DeleteResponse> Delete(string id)
        {
            ApplicationUser appUser = await _userManager.FindByIdAsync(id);
            if (appUser == null)
            {
                _logger.LogWarning("Delete: Could not find user with id: {id}", id);
                return new DeleteResponse() { Success = false, Message = $"User not found. Id: {id}" };
            }
            await _userManager.DeleteAsync(appUser);
            _context.SaveChanges();

            return new DeleteResponse() { Success = true, Message = $"User deleted. Id: {id}" };
        }

        public async Task<AuthenticateResponse> RefreshToken(string token, string ipAddress)
        {
            var user = getUserByRefreshToken(token);
            if (user == null)
            {
                _logger.LogWarning("RefreshToken:  Invalid token: {token}", token);
                return new AuthenticateResponse(false, "Invalid token.");
            }
            var refreshToken = user.RefreshTokens.Single(x => x.Token == token);

            if (refreshToken.IsRevoked)
            {
                // Revoke all descendant tokens in case this token has been compromised.
                revokeDescendantRefreshTokens(refreshToken, user, ipAddress, $"Attempted reuse of revoked ancestor token: {token}");
                _context.Update(user);
                _context.SaveChanges();
            }

            if (!refreshToken.IsActive)
            {
                _logger.LogWarning("RefreshToken:  Invalid token: {token}", token);
                return new AuthenticateResponse(false, "Invalid token");
            }

            // Replace old refresh token with a new one (rotate them)
            var newRefreshToken = rotateRefreshToken(refreshToken, ipAddress);
            user.RefreshTokens.Add(newRefreshToken);

            // Remove old refresh tokens from user
            removeOldRefreshTokens(user);

            // Save changes to db
            _context.Update(user);
            _context.SaveChanges();

            // Generate new jwt
            var secToken = await _jwtHandler.GenerateJwtToken(user);
            var jwt = new JwtSecurityTokenHandler().WriteToken(secToken);

            return new AuthenticateResponse(true, "Token successfully refreshed.", jwt, newRefreshToken.Token, user);
        }

        public string? RevokeToken(string token, string ipAddress)
        {
            var user = getUserByRefreshToken(token);
            if (user == null)
            {
                _logger.LogWarning("RefreshToken:  Invalid token: IP Address: {ipAddress}, Token: {token}", ipAddress, token);
                return "Invalid token.";
            }
            var refreshToken = user.RefreshTokens.Single(x => x.Token == token);
            if (!refreshToken.IsActive)
                return "Invalid token.";

            // Revoke token and save
            revokeRefreshToken(refreshToken, ipAddress, "Revoked without replacement");

            // Save changes to db
            _context.Update(user);
            _context.SaveChanges();

            return null;
        }

        public async Task<IQueryable<UserDTO>> GetAll()
        {
            var users = _context.Users.AsNoTracking()
            .Select(c => new UserDTO()
            {
                Id = c.Id,
                Name = c.DisplayName,
                Email = c.Email,
                EmailConfirmed = c.EmailConfirmed,
                LockoutEnabled = c.LockoutEnabled,
            });

            ApplicationUser appUser = new ApplicationUser();
            foreach (UserDTO u in users)
            {
                appUser.Id = u.Id;
                u.Roles = (await _userManager.GetRolesAsync(appUser)).ToArray();
            }
            return users;
        }

        public async Task<UserDTO> GetById(string id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                _logger.LogWarning("GetById:  Could not find user with id: {id}", id);
                return null!;
            }

            var roles = (await _userManager.GetRolesAsync(user)).ToArray();
            return new UserDTO(user, roles);
        }

        public RefreshToken[] GetRefreshTokens(string userId)
        {
            return _context.RefreshTokens
                        .Where(tok => tok.UserId == userId).ToArray();
        }

        public async Task<bool> IsDupeEmail(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            return user != null;
        }

        public string[] GetRoles()
        {
            return _context.Roles.Select(r => r.Name).ToArray();
        }

        private void removeOldRefreshTokens(ApplicationUser user)
        {
            // remove old inactive refresh tokens from user based on TTL in app settings
            user.RefreshTokens.RemoveAll(x =>
                !x.IsActive &&
                x.Created.AddDays(Convert.ToDouble(_configuration["JwtSettings:RefreshTokenTTL"])) <= DateTime.UtcNow);
        }

        private ApplicationUser? getUserByRefreshToken(string token)
        {
            var user = _context.Users.SingleOrDefault(x => x.RefreshTokens.Any(t => t.Token == token));

            if (user == null)
                _logger.LogWarning("getUserByRefreshToken:  Could not find a user with token: '{token}'", token);

            return user;
        }

        private RefreshToken rotateRefreshToken(RefreshToken refreshToken, string ipAddress)
        {
            var newRefreshToken = _jwtHandler.GenerateRefreshToken(ipAddress);
            revokeRefreshToken(refreshToken, ipAddress, "Replaced by new token", newRefreshToken.Token);
            return newRefreshToken;
        }

        private void revokeDescendantRefreshTokens(RefreshToken refreshToken, ApplicationUser user, string ipAddress, string reason)
        {
            // Recursively traverse the refresh token chain and ensure all descendants are revoked.
            if (!string.IsNullOrEmpty(refreshToken.ReplacedByToken))
            {
                var childToken = user.RefreshTokens.SingleOrDefault(x => x.Token == refreshToken.ReplacedByToken);
                if (childToken != null && childToken.IsActive)
                    revokeRefreshToken(childToken, ipAddress, reason);
                else if (childToken != null)
                    revokeDescendantRefreshTokens(childToken, user, ipAddress, reason);
            }
        }

        private void revokeRefreshToken(RefreshToken token, string ipAddress, string? reason = null, string? replacedByToken = null)
        {
            token.Revoked = DateTime.UtcNow;
            token.RevokedByIp = ipAddress;
            token.ReasonRevoked = reason;
            token.ReplacedByToken = replacedByToken;
        }

    }
}
