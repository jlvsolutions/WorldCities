using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.Extensions.Logging;
using WorldCitiesAPI.Services;
using WorldCitiesAPI.Data.Models.Users;
using WorldCitiesAPI.Data.Models;
using System.ComponentModel.DataAnnotations;

namespace WorldCitiesAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            IUserService userService,
            ILogger<UsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login(AuthenticateRequest model)
        {
            _logger.LogDebug("Received Login Request. Email: {Email}", model.Email);

            var loginResult = await _userService.Login(model, ipAddress());
            if (!loginResult.Success)
            {
                _logger.LogWarning("Login failed.  Email: {Email} Message: {Message}", model.Email, loginResult.Message);
                return Unauthorized(loginResult.Message);
            }

            if (string.IsNullOrEmpty(loginResult.User.RefreshToken))
                return Unauthorized(loginResult.Message);

            setTokenCookieToHttpResponse(loginResult.User.RefreshToken);

            _logger.LogInformation("Login Successful. Name: {Name}, Email: {Email}", loginResult.User.Name, loginResult.User.Email);

            return Ok(loginResult.User);
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register(RegisterRequest model)
        {
            _logger.LogDebug("Received Register Request. Name: {Name}, Email: {Email}", model.Name, model.Email);

            var registerResult = await _userService.Register(model);
            if (!registerResult.Success)
            {
                _logger.LogWarning("Registration for new user failed.   Email: {Email}, Message: {Message}", model.Email, registerResult.Message);
                return Unauthorized(registerResult.Message); // TODO:  Consider returning 409 Conflict.
            }

            _logger.LogInformation("Register: Registration for new user succeeded. Email: {Email}", model.Email);
            return Ok(new { message = registerResult.Message });
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            _logger.LogDebug("Recieved RefreshToken request. In cookie Token: {refreshToken}", refreshToken);

            if (refreshToken == null)
            {
                _logger.LogWarning("RefreshToken:  No refresh token received.");
                return Unauthorized("No refresh token received.");
            }

            var refreshResult = await _userService.RefreshToken(refreshToken, ipAddress());
            if (!refreshResult.Success)
            {
                _logger.LogWarning("RefreshToken:  {Message}", refreshResult.Message);
                return BadRequest(refreshResult.Message);
            }

            if (string.IsNullOrEmpty(refreshResult.User.RefreshToken))
                return Unauthorized(refreshResult.Message);

            setTokenCookieToHttpResponse(refreshResult.User.RefreshToken);
            return Ok(refreshResult.User);
        }

        [HttpPost]
        [Route("IsDupeEmail")] // Thought:  Anonymous access; one could probe for existence of emails in database.
        public async Task<bool> IsDupeEmail(DupeEmailRequest model)
        {
            _logger.LogDebug("Recieved IsDupeEmail Request. Email: {email}", model.Email);

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
                _logger.LogWarning("RevokeToken:  No token found in request body or HTTP cookie.");
                return Unauthorized("Token is required.");
            }

            var resultMsg = _userService.RevokeToken(token, ipAddress());
            if (!string.IsNullOrEmpty(resultMsg))
            {
                _logger.LogWarning("RevokeToken: Unable to revoke token: {token}, {Message}", token, resultMsg);
                return BadRequest(resultMsg);
            }

            _logger.LogDebug("Token revoked. Token: {Token}", token);
            return Ok(new { message = "Token revoked" });
        }

        [HttpPost()]
        [Authorize(Roles = "Administrator")]
        //[ValidateAntiForgeryToken] check this out later.
        public async Task<IActionResult> Create(UserDTO model)
        {
            _logger.LogDebug("Received Create user request. Name: {Name}, Email: {Email}", model.Name, model.Email);

            if (string.IsNullOrEmpty(model.Email))
            {
                _logger.LogWarning("Create:  Email is required.");
                return BadRequest("Email is required.");
            }

            if (string.IsNullOrEmpty(model.NewPassword))
            {
                _logger.LogWarning("Create:  Password is required.");
                return BadRequest("Password is required.");
            }

            if (string.IsNullOrEmpty(model.Name))
            {
                _logger.LogWarning("Create:  Name is required.");
                return BadRequest("Name is required.");
            }

            var createResult = await _userService.Create(model);
            if (!createResult.Success)
            {
                _logger.LogWarning("Create:  Failed to create user. Email: {Email}. {Message}", model.Email, createResult.Message);
                return BadRequest(createResult.Message);
            }
            _logger.LogInformation("Create:  Successfully created user. Email: {Email}", model.Email);

            return CreatedAtAction(nameof(GetById), new { id = createResult.Message }, model);
        }

        [HttpGet]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<ApiResult<UserDTO>>> GetUsers(
            int pageIndex = 0,
            int pageSize = 10,
            string? sortColumn = null,
            string? sortOrder = null,
            string? filterColumn = null,
            string? filterQuery = null)
        {
            _logger.LogInformation("Entering GetUsers. PageIndex: {pageIndex}, Filter: {filterQuery}, SortColumn: {sortColumn}, SortOrder: {sortOrder}",
                pageIndex, filterQuery, sortColumn, sortOrder);
            try
            {
                var allUsers = _userService.GetAll();

                var apiResult = await ApiResult<UserDTO>.CreateAsync(
                    allUsers,
                    pageIndex,
                    pageSize,
                    sortColumn,
                    sortOrder,
                    filterColumn,
                    filterQuery);

                foreach (UserDTO user in apiResult.Data)
                    if (!string.IsNullOrEmpty(user.Id))
                        user.Roles = await _userService.GetRoles(user.Id);

                return apiResult;
            }
            catch (NotSupportedException ex)
            {
                _logger.LogError(ex, "GetCities:  " + ex.Message + ex.StackTrace);
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "GetCities:  " + ex.Message + ex.StackTrace);
                return BadRequest("An invalid operation was attempted.");
            }
            // Middleware to handle other exception types.
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> GetById(string id)
        {
            _logger.LogDebug("Received GetById user request. Id: {id}", id);

            var user = await _userService.GetById(id);
            if (user == null)
            {
                _logger.LogWarning("GetById:  User not found for id: {id}", id);
                return NotFound();
            }
            return Ok(user);
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
        public ActionResult<string[]> GetRoles()
        {
            _logger.LogDebug("Received GetRoles request.");
            return Ok(_userService.GetAllRoles());
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Update(string id, UserDTO model)
        {
            _logger.LogDebug("Received Update user request.  Updating user: {Email}", model.Email);

            // Make sure valid ids are provided.
            if (string.IsNullOrEmpty(id)
                || model == null
                || string.IsNullOrEmpty(model.Id)
                || !id.Equals(model.Id))
            {
                _logger.LogWarning($"Update: Invalid id: {id}, user, or user id: {model?.Id}");
                return BadRequest("Invalid user Id.");
            }
            var updateResult = await _userService.Update(id, model);
            if (!updateResult.Success)
                _logger.LogWarning("Update:  Failed. Msg: {Messsage}", updateResult.Message);

            if (updateResult.NotFound)
            {
                return NotFound(updateResult.Message);
            }
            else if (updateResult.Conflict)
            {
                return Conflict(updateResult.Message);
            }
            else if (updateResult.Unauthorized)
            {
                return Unauthorized(updateResult.Message);
            }
            else if (!updateResult.Success)
            {
                return BadRequest(updateResult.Message);
            }
            _logger.LogInformation("Updated user. Id: {id}", id);

            return Ok(updateResult);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Delete(string id)
        {
            _logger.LogDebug("Received Delete user request. Id: {Id}", id);

            var deleteResult = await _userService.Delete(id);
            if (!deleteResult.Success)
            {
                _logger.LogWarning("Failed to Delete user. Id: {Id}, Message: {Message}", id, deleteResult.Message);
                return NotFound(deleteResult.Message);
            }
            _logger.LogInformation("Deleted user. {id}", id);
            
            return Ok(new { message = deleteResult.Message });
        }

        #region Helper Methods
        /// <summary>
        /// Appends a HTTP Only cookie with refresh token to the http response.
        /// </summary>
        /// <param name="token"></param>
        private void setTokenCookieToHttpResponse(string token)
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
