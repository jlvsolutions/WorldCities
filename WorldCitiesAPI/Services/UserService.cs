//using BCrypt.Net;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using WorldCitiesAPI.Data;
using WorldCitiesAPI.Data.Models.Users;
using WorldCitiesAPI.Data.Entities;
using WorldCitiesAPI.Helpers;
using AutoMapper;

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
        IQueryable<UserDTO> GetAll();
        Task<UserDTO> GetById(string id);
        Task<bool> IsDupeEmail(string email);
        Task<string[]> GetRoles(string id);
        string[] GetAllRoles();
        RefreshToken[] GetRefreshTokens(string userId);
    }

    public class UserService : IUserService
    {
        const string Role_RegisteredUser = "RegisteredUser";
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtHandler _jwtHandler;
        private readonly IMapper _mapper;
        private readonly ILogger<UserService> _logger;

        public UserService(
            IConfiguration configuration,
            ApplicationDbContext context, 
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager,
            JwtHandler jwtHandler,
            IMapper mapper,
            ILogger<UserService> logger)
        {
            _configuration = configuration;
            _context = context;
            _roleManager = roleManager;
            _userManager = userManager;
            _jwtHandler = jwtHandler;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<AuthenticateResponse> Login(AuthenticateRequest model, string ipAddress)
        {
            var user = _context.Users
                .Include(user => user.RefreshTokens)
                .SingleOrDefault(user => user.Email == model.Email);

            // Validate
            if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
            {
                return new AuthenticateResponse()
                {
                    Success = false,
                    Message = "Invalid Email or Password"
                };
            }
            var roles = (await _userManager.GetRolesAsync(user)).ToArray();

            // Authentication successful, so generate jwt and refresh tokens.
            var secToken = await _jwtHandler.GenerateJwtToken(user);
            var jwt = new JwtSecurityTokenHandler().WriteToken(secToken);
            var refreshToken = _jwtHandler.GenerateRefreshToken(ipAddress);

            user.RefreshTokens.Add(refreshToken);

            // Remove old refresh tokens from user.
            removeOldRefreshTokens(user);

            // Save changes to the DB.
            _context.Update(user);
            _context.SaveChanges();

            var userDTO = _mapper.Map<UserDTO>(user);
            userDTO.Roles = roles;
            userDTO.JwtToken = jwt;
            userDTO.RefreshToken = refreshToken.Token;
            
            return new AuthenticateResponse()
            {
                Success = true,
                Message = "Authentication Success",
                User = userDTO
            };
        }

        public async Task<RegisterResponse> Register(RegisterRequest model)
        {
            // Ensure user does not already exists.
            if (await _userManager.FindByEmailAsync(model.Email) != null)
            {
                return new RegisterResponse() { Success = false, Message = "Registration failed.  User Email already exists." };
            }

            // Create a new standard ApplicationUser account
            var appUser = new ApplicationUser()
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Email,
                Email = model.Email,
                DisplayName = model.Name
            };

            // Insert the new RegisteredUser into the DB
            // TODO:  Consider adding more error detection.
            await _userManager.CreateAsync(appUser, model.Password);
            await _userManager.AddToRoleAsync(appUser, Role_RegisteredUser);

            // Force Confirm the e-mail and Remove Lockout.
            appUser.EmailConfirmed = true;
            appUser.LockoutEnabled = false;

            await _context.SaveChangesAsync();

            return new RegisterResponse() { Success = true, Message = "Registration was successful." };
        }

        public async Task<CreateResponse> Create(UserDTO model)
        {
            // Setup the default role name
            string role_RegisteredUser = "RegisteredUser";
            if (model.Roles == null || model.Roles.Length == 0)
                model.Roles = new string[] { role_RegisteredUser };

            if (await _userManager.FindByEmailAsync(model.Email) != null)
            {
                return new CreateResponse()
                { 
                    Success = false,
                    Message = $"User with Email {model.Email} already exists."
                };
            }

            if (string.IsNullOrEmpty(model.NewPassword))
            {
                return new CreateResponse()
                {
                    Success = false,
                    Message = "Password is required."
                };
            }

            // Create a new standard ApplicationUser account
            var appUser = _mapper.Map<ApplicationUser>(model);  // TODO:  Working on the Automapper now.....
            appUser.Id = Guid.NewGuid().ToString();
            //appUser.SecurityStamp = Guid.NewGuid().ToString();

            // Insert the application user into the DB
            var identityResult = await _userManager.CreateAsync(appUser, model.NewPassword);
            if (!identityResult.Succeeded)
            {
                return new CreateResponse()
                {
                    Success = false,
                    Message = $"Failed to create user for {model.Email}. {identityResult.ToString}"
                };
            }
            var saveResult = await _context.SaveChangesAsync();

            string newId = (await _userManager.FindByEmailAsync(model.Email)).Id;

            // Feature:  If a new role is found in the updated users' Roles,
            // go ahead and add that role into the database.
            // TODO: Possibly add flag/setting that enables/disables this logic.
            foreach (string role in model.Roles)
            {
                if ((await _roleManager.FindByNameAsync(role)) == null)
                    await _roleManager.CreateAsync(new IdentityRole(role));
                if (!(await _userManager.IsInRoleAsync(appUser, role)))
                    await _userManager.AddToRoleAsync(appUser, role);
            }
                
            await _context.SaveChangesAsync();

            return new CreateResponse()
            {
                Success = true,
                Message = newId
            };
        }

        public async Task<UpdateResponse> Update(string id, UserDTO model)
        {
            // Check for unauthorized update
            if (string.IsNullOrEmpty(model.Id) || !id.Equals(model.Id))
            {
                return new UpdateResponse()
                {
                    Unauthorized = true,
                    Message = "Unauthorized update."
                };
            }

            // Check for id existing
            var appUser = _context.Users.Find(id);
            if (appUser == null)
            {
                return new UpdateResponse()
                {
                    NotFound = true,
                    Message = $"User with Id: {id} not found."
                };
            }

            // Check for Email/UserName conflict
            if (_context.Users.Any(user => user.Email.Equals(model.Email) && user.Id != id))
            {
                return new UpdateResponse()
                {
                    Conflict = true,
                    Message = "Email/UserName already exists."
                };
            }

            _mapper.Map(model, appUser);
            appUser.SecurityStamp = Guid.NewGuid().ToString();

            // User
            var updateResult = await _userManager.UpdateAsync(appUser);
            if (!updateResult.Succeeded)
            {
                _logger.LogError("Update: UpdateAsync failed. id:{id}, name:{Name} email: {Email} Errors: {errors}", id, model.Name, model.Email, updateResult.ToString());
                return new UpdateResponse()
                { 
                    Success = false, 
                    Message = $"Unable to update user. {updateResult}"
                };
            }

            // Roles
            // Feature:  If a new role is found in the updated users' Roles,
            // go ahead and add that role in the database.
            // TODO: Add flag that enables/disables this logic.
            if (model.Roles != null && model.Roles.Length > 0)
                foreach (string role in model.Roles)
                {
                    if ((await _roleManager.FindByNameAsync(role)) == null)
                        await _roleManager.CreateAsync(new IdentityRole(role));
                    if (!(await _userManager.IsInRoleAsync(appUser, role)))
                        await _userManager.AddToRoleAsync(appUser, role);
                }

            // Check for any roles that were removed
            var currentRoles = await _userManager.GetRolesAsync(appUser);
            if (model.Roles != null)
                foreach (string role in currentRoles)
                    if (!model.Roles.Contains(role))
                        await _userManager.RemoveFromRoleAsync(appUser, role);


            //Password
            if (!string.IsNullOrEmpty(model.NewPassword))
            {
                _logger.LogDebug("Update: Changing password for {email}", appUser.Email);
                await _userManager.RemovePasswordAsync(appUser);
                await _userManager.AddPasswordAsync(appUser, model.NewPassword);
            }

            //Save Changes
            _context.SaveChanges();
            _logger.LogInformation("Update:  User update successful: {Email}", model.Email);

            return new UpdateResponse() { Success = true, Message = "Update successful." };
        }

        public async Task<DeleteResponse> Delete(string id)
        {
            ApplicationUser appUser = await _userManager.FindByIdAsync(id);
            if (appUser == null)
            {
                return new DeleteResponse()
                { 
                    Success = false,
                    Message = $"User not found. Id: {id}"
                };
            }
            //var refreshTokens = _context.RefreshTokens.Where(t => t.UserId == id).ToArray();
            //_context.RefreshTokens.RemoveRange(refreshTokens);
            await _userManager.DeleteAsync(appUser);
            _context.SaveChanges();

            return new DeleteResponse()
            { 
                Success = true, 
                Message = $"User deleted. Id: {id}"
            };
        }

        public async Task<UserDTO> GetById(string id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                _logger.LogWarning("GetById:  Could not find user with id: {id}", id);
                return null!;
            }

            var userDTO = _mapper.Map<UserDTO>(user);
            userDTO.Roles = (await _userManager.GetRolesAsync(user)).ToArray();
            return userDTO;
        }

        public IQueryable<UserDTO> GetAll()
        {
            var users = _context.Users.AsNoTracking()
            .Select( c => new UserDTO()
            {
                Id = c.Id,
                Name = c.DisplayName,
                Email = c.Email,
                EmailConfirmed = c.EmailConfirmed,
                LockoutEnabled = c.LockoutEnabled
        });

            return users;
        }

        public async Task<bool> IsDupeEmail(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            return user != null;
        }

        public async Task<string[]> GetRoles(string id)
        {
            ApplicationUser user = new ApplicationUser() { Id = id };
            return (await _userManager.GetRolesAsync(user)).ToArray();
        }

        public string[] GetAllRoles()
        {
            return _context.Roles.Select(r => r.Name).ToArray();
        }

        public RefreshToken[] GetRefreshTokens(string userId)
        {
            return _context.RefreshTokens
                        .Where(tok => tok.UserId == userId).ToArray();
        }

        public async Task<AuthenticateResponse> RefreshToken(string token, string ipAddress)
        {
            var appUser = getUserByRefreshToken(token);
            if (appUser == null)
            {
                return new AuthenticateResponse() 
                { 
                    Success = false, 
                    Message = "Invalid token." 
                };
            }

            var refreshToken = appUser.RefreshTokens.Single(x => x.Token == token);
            if (refreshToken.IsRevoked)
            {
                // Revoke all descendant tokens in case this token has been compromised.
                revokeDescendantRefreshTokens(refreshToken, appUser, ipAddress, $"Attempted reuse of revoked ancestor token: {token}");
                _context.Update(appUser);
                _context.SaveChanges();
            }

            if (!refreshToken.IsActive)
            {
                return new AuthenticateResponse()
                {
                    Success = false,
                    Message = "Invalid token not active."
                };
            }

            // Replace old refresh token with a new one (rotate them)
            var newRefreshToken = rotateRefreshToken(refreshToken, ipAddress);
            appUser.RefreshTokens.Add(newRefreshToken);

            // Remove old refresh tokens from user
            removeOldRefreshTokens(appUser);

            // Save changes to db
            _context.Update(appUser);
            _context.SaveChanges();

            
            // Generate new jwt
            var secToken = await _jwtHandler.GenerateJwtToken(appUser);
            var jwt = new JwtSecurityTokenHandler().WriteToken(secToken);
            
            var userDTO = _mapper.Map<UserDTO>(appUser);
            userDTO.JwtToken = jwt;
            userDTO.RefreshToken = newRefreshToken.Token;
            userDTO.Roles = (await _userManager.GetRolesAsync(appUser)).ToArray();

            return new AuthenticateResponse()
            {
                Success = true,
                Message = "Token successfully refreshed.",
                User = userDTO
            };
        }

        public string? RevokeToken(string token, string ipAddress)
        {
            var user = getUserByRefreshToken(token);
            if (user == null)
            {
                _logger.LogWarning("RefreshToken:  Invalid token: IP Address: {ipAddress}, Token: {token}", ipAddress, token);
                return "Invalid token. User not found.";
            }
            var refreshToken = user.RefreshTokens.Single(x => x.Token == token);
            if (!refreshToken.IsActive)
                return "Invalid token. Token is not active.";

            // Revoke token and save
            revokeRefreshToken(refreshToken, ipAddress, "Revoked without replacement");

            // Save changes to db
            _context.Update(user);
            _context.SaveChanges();

            return null;
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
            var user = _context.Users
                .Include(u => u.RefreshTokens)
                .SingleOrDefault(x => x.RefreshTokens.Any(t => t.Token == token));

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
