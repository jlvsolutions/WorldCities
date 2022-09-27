using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorldCitiesAPI.Data.Entities;
using WorldCitiesAPI.Data.Models;
using WorldCitiesAPI.Services;
using Moq;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using WorldCitiesAPI.Data.Models.Users;

namespace WorldCitiesAPI.Tests.Services
{
    public class UserService_Tests : IDisposable
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtHandler _jwtHandler;
        private readonly ILogger<UserService> _logger;
        private readonly UserService _userService;

        public UserService_Tests()
        {
            Console.WriteLine("UserService_Tests Starting.");

            // Create a IConfiguratoin mock instance
            var mockConfiguration = new Mock<IConfiguration>();
            mockConfiguration.SetupGet(x => x[It.Is<string>(s => s == "JwtSettings:SecurityKey")]).Returns("MyVeryOwnTestSecurityKey");
            mockConfiguration.SetupGet(x => x[It.Is<string>(s => s == "JwtSettings:Issuer")]).Returns("MyVeryOwnTestIssuer");
            mockConfiguration.SetupGet(x => x[It.Is<string>(s => s == "JwtSettings:Audience")]).Returns("https://localhost:4200");
            mockConfiguration.SetupGet(x => x[It.Is<string>(s => s == "JwtSettings:ExpirationTimeoutInMinutes")]).Returns("15");
            mockConfiguration.SetupGet(x => x[It.Is<string>(s => s == "JwtSettings:RefreshTokenTTL")]).Returns("2");
            _configuration = mockConfiguration.Object;

            // Create the option instances required by the ApplicationDbContext
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "WorldCities")
                .Options;

            // Create an ApplicationDbContext instance using the in-memory DB
            _context = new ApplicationDbContext(options);

            // Create a RoleManager instance and a default role
            _roleManager = IdentityHelper.GetRoleManager(new RoleStore<IdentityRole>(_context));

            // Create a UserManager instance and a default user
            _userManager = IdentityHelper.GetUserManager(new UserStore<ApplicationUser>(_context));

            // Create a JwtHandler instance
            _jwtHandler = new JwtHandler(_configuration, _userManager, new NullLogger<JwtHandler>(), _context);

            // Create a ILogger instance for the service
            _logger = new NullLogger<UserService>();

            // Create the service to test
            _userService = new UserService(
                _configuration,
                _context,
                _roleManager,
                _userManager,
                _jwtHandler,
                _logger);

        }

        public void Dispose()
        {
            Console.WriteLine("Dispose.");
            _context.Dispose();
        }

        [Fact]
        public async Task Register_NewUserShouldCreate()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager);
            await _roleManager.CreateAsync(new IdentityRole("RegisteredUser"));
            _context.SaveChanges();

            //
            // Act
            var request = new RegisterRequest() { Name = "NewDisplayName", Email = "NewEmail@email.com", Password = "NewPassword" };
            var response = await _userService.Register(request);

            //
            // Assert the response
            Assert.NotNull(response);
            Assert.True(response.Success);
            Assert.NotEmpty(response.Message);

            //
            // Assert the database
            var userByEmail = await _userManager.FindByEmailAsync("NewEmail@email.com");
            var userByName = await _userManager.FindByNameAsync("NewEmail@email.com");
            var userRoles = await _userManager.GetRolesAsync(userByEmail);
            Assert.NotNull(userByEmail);
            Assert.NotNull(userByName);
            Assert.NotEmpty(userRoles);
            Assert.Contains<string>("RegisteredUser", userRoles);
            Assert.NotEmpty(userByEmail.SecurityStamp);
            Assert.True(userByEmail.EmailConfirmed);
            Assert.False(userByEmail.LockoutEnabled);
            Assert.Equal(2, _context.Users.Count());
            Assert.True(await _userManager.CheckPasswordAsync(userByEmail, "NewPassword"));

            Console.WriteLine("Register_NewUserShouldCreate() done.");
        }

        [Fact]
        public async Task Register_ExistingUserShouldFail()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com");

            //
            // Act
            var request = new RegisterRequest() { Name = "NewDisplayName", Email = "exists@email.com", Password = "NewPassword" };
            var response = await _userService.Register(request);

            //
            // Assert the response
            Assert.NotNull(response);
            Assert.False(response.Success);
            Assert.NotEmpty(response.Message);
            Assert.Equal(1, _context.Users.Count());

            Console.WriteLine("Register_ExistingUserShouldFail() done.");
        }

        [Fact]
        public async Task Login_NonExistingUserFails()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "existsPassword");

            //
            // Act
            var request = new AuthenticateRequest() { Email = "NotExists@email.com", Password = "Password" };
            var response = await _userService.Login(request, "127.0.0.1");

            //
            // Assert the response
            Assert.NotNull(response);
            Assert.False(response.Success);
            Assert.NotEmpty(response.Message);

            //
            // Assert the database
            Assert.Equal(0, _context.RefreshTokens.Count());

        }

        [Fact]
        public async Task Login_ExistingUserBadPasswordFails()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "existsPassword");

            //
            // Act
            var request = new AuthenticateRequest() { Email = "exists@email.com", Password = "ThisIsBadPassword" };
            var response = await _userService.Login(request, "127.0.0.1");

            //
            // Assert the response
            Assert.NotNull(response);
            Assert.False(response.Success);
            Assert.NotNull(response.Message);

            //
            // Assert the database
            Assert.Equal(0, _context.RefreshTokens.Count());
        }

        [Fact]
        public async Task Login_ExistingUserShouldGetJwtAndRefreshTokens()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "existsPassword");
            await _roleManager.CreateAsync(new IdentityRole("RegisteredUser"));
            _context.SaveChanges();
            var user = await _userManager.FindByEmailAsync("exists@email.com");
            // Add an expired refresh token.
            user.RefreshTokens = new List<RefreshToken>() 
            { 
                new RefreshToken() 
                { 
                    Created = DateTime.UtcNow.AddDays(-8),
                    CreatedByIp = "127.0.0.1",
                    Token = "TestToken"
                } 
            };
            await _userManager.AddToRoleAsync(user, "RegisteredUser");
            _context.SaveChanges();

            //
            // Act
            var request = new AuthenticateRequest() { Email = "exists@email.com", Password = "existsPassword" };
            var response = await _userService.Login(request, "127.0.0.1");

            //
            // Assert the response
            Assert.NotNull(response);
            Assert.True(response.Success);
            Assert.NotEmpty(response.Message);
            Assert.NotEmpty(response.Token);
            Assert.NotEmpty(response.RefreshToken);
            Assert.NotNull(response.User);
            Assert.NotEmpty(response.User?.Id);
            Assert.NotEmpty(response.User?.Name);
            Assert.NotEmpty(response.User?.Email);
            Assert.True(response.User?.EmailConfirmed);
            Assert.False(response.User?.LockoutEnabled);
            Assert.Null(response.User?.NewPassword);
            Assert.Equal(1, response.User?.Roles.Length);
            Assert.Contains("RegisteredUser", response.User?.Roles);

            //
            // Assert the database
            Assert.Equal(1, _context.RefreshTokens.Count());
            Assert.DoesNotContain("TestToken", _context.RefreshTokens.First().Token);
        }

        [Fact]
        public async Task Create_ShouldFaildIfUserEmailAlreadyExists()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com");

            //
            // Act
            UserDTO testUser = new UserDTO()
            {
                Name = "ExistingUserName",
                Email = "exists@email.com",
            };
            var response = await _userService.Create(testUser);

            //
            // Assert the response
            Assert.NotNull(response);
            Assert.False(response.Success);
            Assert.NotEmpty(response.Message);
            Assert.Equal(1, _context.Users.Count());
            Assert.Contains("DisplayName:exists@email", _context.Users.First().DisplayName);
        }

        [Fact]
        public async Task Create_NewUserWithMissingFieldShouldFail()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", new string[1] { "RegisteredUser" });

            //
            // Act
            UserDTO newUserDTO = new UserDTO()
            { 
                Name = "NewUserName",
                Email = "newuser@email.com",
                Roles = new string[2] { "TestRole1", "TestRole2" }
                // Required new password missing.
            };
            var response = await _userService.Create(newUserDTO);

            //
            // Assert the response
            Assert.NotNull(response);
            Assert.False(response.Success);
            Assert.NotEmpty(response.Message);

            //
            // Assert the database
            Assert.Equal(1, _context.Users.Count());
            Assert.Contains("exists@email.com", _context.Users.First().Email);

        }

        [Fact]
        public async Task Create__NewUserShouldCreate()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", new string[1] { "RegisteredUser" } );

            //
            // Act
            UserDTO testUser = new UserDTO()
            {
                Name = "NewUserName",
                Email = "newuser@email.com",
                Roles = new string[2] { "TestRole1", "TestRole2" },
                NewPassword = "password"
            };
            var response = await _userService.Create(testUser);
            var newUser = await _userManager.FindByEmailAsync(testUser.Email);

            //
            // Assert the response
            Assert.NotNull(response);
            Assert.True(response.Success);
            Assert.NotEmpty(response.Message);

            //
            // Assert the database
            Assert.NotNull(newUser);
            Assert.Equal(2, _context.Users.Count());
            Assert.True(await _userManager.IsInRoleAsync(newUser, "TestRole1"));
            Assert.True(await _userManager.IsInRoleAsync(newUser, "TestRole2"));
            Assert.True(await _userManager.CheckPasswordAsync(newUser, "password"));
        }

        [Fact]
        public async Task Create_NewUserWithoutRolesShouldBeAddedToRegisteredUserRole()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", new string[1] { "RegisteredUser" });

            //
            // Act
            UserDTO testUser = new UserDTO()
            {
                Name = "NewUserName",
                Email = "newuser@email.com",
                NewPassword = "password"
            };
            var response = await _userService.Create(testUser);
            var newUser = await _userManager.FindByEmailAsync(testUser.Email);

            //
            // Assert the response
            Assert.NotNull(response);
            Assert.True(response.Success);
            Assert.NotEmpty(response.Message);

            //
            // Assert the database
            Assert.NotNull(newUser);
            Assert.Equal(2, _context.Users.Count());
            Assert.True(await _userManager.IsInRoleAsync(newUser, "RegisteredUser"));
            Assert.True(await _userManager.CheckPasswordAsync(newUser, "password"));

        }
    }
}
