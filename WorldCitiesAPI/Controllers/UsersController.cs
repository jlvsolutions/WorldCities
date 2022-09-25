using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WorldCitiesAPI.Services;
using WorldCitiesAPI.Data;
using WorldCitiesAPI.Data.Models.Users;

namespace WorldCitiesAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly ILogger<UsersController> _logger;
        private readonly JwtHandler _jwtHandler;

        public UsersController(
            UserService userService,
            JwtHandler jwtHandler,
            ILogger<UsersController> logger)
        {
            _userService = userService;
            _jwtHandler = jwtHandler;
            _logger = logger;
        }

        [HttpPost("Login")]
        public async Task<ActionResult> Login(AuthenticateRequest model)
        {
            _logger.LogDebug("Received Login Request. Email: {Email}", model.Email);
            
            // Authenticate the user
            var response = await _userService.Login(model, ipAddress());
            if (!response.Success)
            {
                _logger.LogInformation("Login: Authenticattion failed.  Email: {Email}", model.Email);
                return Ok(response);
            }

            // Success, provide a refresh token.
            setTokenCookie(response.RefreshToken ?? "");
            _logger.LogInformation("Login: Authentication Successful. Email: {Email}", model.Email);

            return Ok(response);
        }

        [HttpPost("Register")]
        public async Task<ActionResult> Register(RegisterRequest model)
        {
            _logger.LogDebug("Received Register Request. Name: {Name}, Email: {Email}", model.Name, model.Email);
            if (string.IsNullOrEmpty(model.Name))
            {
                var msg = "Display Name is required.";
                _logger.LogWarning("Register: {msg}", msg);
                return BadRequest(msg);
            }

            if (string.IsNullOrEmpty(model.Email))
            {
                var msg = "Email is required.";
                _logger.LogWarning("Register: {msg}", msg);
                return BadRequest(msg);
            }

            if (string.IsNullOrEmpty(model.Password))
            {
                var msg = "Password is required.";
                _logger.LogWarning("Register: {msg}", msg);
                return BadRequest(msg);
            }

            var response = await _userService.Register(model);
            if (response.Success)
                _logger.LogInformation("Register: Registration for new user succeeded. Email: {Email}", model.Email);
            else
                _logger.LogWarning("Regiistration for new user failed.  Message: {Message}, Email: {Email}", response.Message, model.Email);
            return Ok(response);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            _logger.LogDebug("Recieved RefreshToken request. In cookie Token: {refreshToken}", refreshToken);

            if (refreshToken == null)
            {
                _logger.LogWarning("RefreshToken:  No token received.");
                return BadRequest("Refresh token required.");
            }

            var response = await _userService.RefreshToken(refreshToken, ipAddress());
            if (response.RefreshToken == null)
            {
                _logger.LogWarning("RefreshToken:  Did not get a new refresh token for {refreshToken}", refreshToken);
                return BadRequest(response);
            }

            setTokenCookie(response.RefreshToken);
            return Ok(response);
        }

        // Thought:  Anonymous access; one could probe for existence of emails in database.
        [HttpPost]
        [Route("IsDupeEmail")]
        public async Task<bool> IsDupeEmail(DupeEmailRequest model)
        {
            _logger.LogDebug("IsDupeEmail Request. Email: {email}", model.Email);

            var isDupe = await _userService.IsDupeEmail(model.Email);
            _logger.LogInformation("IsDupeEmail {email} is {dupe}", model.Email, isDupe);
            return isDupe;
        }

        [HttpPost("revoke-token")]
        [Authorize(Roles = "RegisteredUser")]
        public IActionResult RevokeToken(RevokeTokenRequest model)
        {
            // Accept refresh token in request body or cookie
            var token = model.Token ?? Request.Cookies["refreshToken"];
            _logger.LogDebug("Received RevokeToken request. In {where}. Token: {refreshToken}", model.Token != null ? "Body" : "Cookie", token);

            if (string.IsNullOrEmpty(token))
            {
                _logger.LogWarning("RevokeToken:  No token found in request body or cookies.");
                return BadRequest(new { message = "Token is required" });
            }

            var resultMsg = _userService.RevokeToken(token, ipAddress());
            if (!string.IsNullOrEmpty(resultMsg))
            {
                _logger.LogWarning("RevokeToken: Unable to revoke token: {token}", token);
                return BadRequest(resultMsg);
            }

            _logger.LogDebug("Token revoked. Token: {Token}", token);
            return Ok(new { message = "Token revoked" });
        }

        [HttpPost()]
        [Authorize(Roles = "Administrator")]
        //[ValidateAntiForgeryToken] check this out later.
        public async Task<IActionResult> Create(UserDTO user)
        {
            _logger.LogDebug("Received Create user request. Name: {Name}, Email: {Email}", user.Name, user.Email);

            if (string.IsNullOrEmpty(user.Email))
            {
                var msg = "Email is required.";
                _logger.LogWarning("Create: {msg}", msg);
                return BadRequest(msg);
            }

            if (string.IsNullOrEmpty(user.NewPassword))
            {
                var msg = "Password is required.";
                _logger.LogWarning("Create: {msg}", msg);
                return BadRequest(msg);
            }

            if (string.IsNullOrEmpty(user.Name))
            {
                var msg = "User name is required.";
                _logger.LogWarning("Create: {msg}", msg);
                return BadRequest(msg);
            }

            var response = await _userService.Create(user);
            if (response.Success)
                _logger.LogInformation("Create:  Successfully created user. Email: {Email}", user.Email);
            else
                _logger.LogWarning("Create:  Failed to create user. Email: {Email}", user.Email);

            return Ok(response);
        }

        [HttpGet]
        [Authorize(Roles = "Administrator")]
        public async Task<ApiResult<UserDTO>> GetAll(
            int pageIndex = 0,
            int pageSize = 10,
            string? sortColumn = null,
            string? sortOrder = null,
            string? filterColumn = null,
            string? filterQuery = null)
        {
            _logger.LogDebug("Received GetAll users request. PageIndex: {pageIndex}, SortOrder: {sortOrder}", pageIndex, sortOrder);

            var allUsers = await _userService.GetAll();
            var apiResult = await ApiResult<UserDTO>.CreateAsync(
                allUsers,
                pageIndex,
                pageSize,
                sortColumn,
                sortOrder,
                filterColumn,
                filterQuery);

            return apiResult;
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<UserDTO>> GetById(string id)
        {
            _logger.LogDebug("Received GetById user request. Id: {id}", id);

            var user = await _userService.GetById(id);
            if (user == null)
            {
                _logger.LogWarning("GetById:  User not found for id: {id}", id);
                return NotFound();
            }
            return user;
        }

        [HttpGet("{id}/refresh-tokens")]
        [Authorize(Roles = "RegisteredUser")]
        public IActionResult GetRefreshTokens(string id)
        {
            _logger.LogDebug("Received GetRefreshTokens request.  Id: {id}", id);

            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("GetRefreshTokens: Received null or empty user id.");
                return BadRequest("Invalid user id");
            }
            return Ok(_userService.GetRefreshTokens(id));
        }

        [HttpGet("Roles")]
        [Authorize(Roles = "Administrator")]
        public IActionResult GetRoles()
        {
            _logger.LogDebug("Received GetRoles request.");
            return Ok(_userService.GetRoles());
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Update(string id, UserDTO user)
        {
            _logger.LogDebug("Received Update user request.  Updating user: {Email}", user.Email);

            if (string.IsNullOrEmpty(id) || user == null || !id.Equals(user.Id))
            {
                _logger.LogWarning("Update: Invalid id: {id}", id);
                return BadRequest(new { message = "Invalid user Id."});
            }
            var response = await _userService.Update(id, user);
            if (response.Success)
                _logger.LogInformation("Updated user. Id: {id}", id);
            else
                _logger.LogWarning("Failed to update user. Id: {Id}, Message: {Message}", id, response.Message);
            return Ok(response);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Delete(string id)
        {
            _logger.LogDebug("Received Delete user request. Id: {Id}", id);

            var response = await _userService.Delete(id);
            if (response.Success)
                _logger.LogInformation("Deleted user. {id}", id);
            else
                _logger.LogWarning("Failed to Delete user. Id: {Id}, Message: {Message}", id, response.Message);
            return Ok(response);
        }

        #region Helper Methods
        /// <summary>
        /// Appends a HTTP Only cookie with refresh token to the http response.
        /// </summary>
        /// <param name="token"></param>
        private void setTokenCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,  // Only send cookie over HTTPS.
                Expires = DateTime.UtcNow.AddDays(7)
            };
            Response.Cookies.Append("refreshToken", token, cookieOptions);
        }

        /// <summary>
        /// Gets source ip address for the current request.
        /// </summary>
        /// <returns>IPv4 string version of IP Address.</returns>
        private string ipAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
                return Request.Headers["X-Forwarded-For"];
            else
                return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "";
        }
        #endregion
    }
}
