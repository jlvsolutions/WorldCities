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
using WorldCitiesAPI.Helpers;

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
                .UseLazyLoadingProxies()
                .UseInMemoryDatabase(databaseName: "UserService_Tests")
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
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "existsPassword", new string[1] { "RegisteredUser" });
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
            Assert.NotEmpty(response.JwtToken);
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

        [Fact]
        public async Task Update_NonExistingUserShouldFaild()
        {
            //
            // Arrange
            IdentityHelper.TruncateIdentityTables(_context);

            //
            // Act
            var response = await _userService.Update("BadId", new UserDTO());

            //
            // Assert
            Assert.NotNull(response);
            Assert.False(response.Success);
            Assert.NotEmpty(response.Message);

            //
            // Assert database
            Assert.Equal(0, _context.Users.Count());
            Assert.Equal(0, _context.Roles.Count());
            Assert.Equal(0, _context.RefreshTokens.Count());
        }

        [Fact]
        public async Task Update_EmailConflictShouldFail()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", new string[1] { "RegisteredUser" });
            var userToUpdate = new ApplicationUser()
            {
                DisplayName = "DisplayName",
                Email = "ToUpdateEmail@email.com",
                UserName = "ToUpdateEmail@email.com",
                EmailConfirmed = true,
                LockoutEnabled = false
            };
            await _userManager.CreateAsync(userToUpdate);
            userToUpdate.Email = "exists@email.com";

            //
            // Act
            var response = await _userService.Update(userToUpdate.Id, new UserDTO() { Email = "exists@email.com" });

            //
            // Assert
            Assert.NotNull(response);
            Assert.False(response.Success);
            Assert.NotEmpty(response.Message);

            //
            // Assert database
            Assert.Equal(2, _context.Users.Count());
            Assert.Equal(1, _context.Roles.Count());
            Assert.Equal(0, _context.RefreshTokens.Count());
        }

        [Fact]
        public async Task Update_EmailChangeShouldUpdateSecurityStamp()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", new string[1] { "RegisteredUser" });
            var user = await _userManager.FindByEmailAsync("exists@email.com");
            var updatedUserDTO = new UserDTO(user, Array.Empty<string>());
            updatedUserDTO.Email = "newemail@email.com";
            var existingSecurityStamp = user.SecurityStamp;

            //
            // Act
            var response = await _userService.Update(user.Id, updatedUserDTO);

            //
            // Assert response
            Assert.NotNull(response);
            Assert.True(response.Success);
            Assert.NotEmpty(response.Message);

            //
            // Assert Database
            Assert.NotEqual(user.SecurityStamp, existingSecurityStamp);

        }

        [Fact]
        public async Task Update_UpdateShouldUpdateAllFieldsAndRoles()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", 
                new string[4] 
                { 
                    "RegisteredUser",
                    "Role1",
                    "Role2",
                    "Role3"
                });
            var user = await _userManager.FindByEmailAsync("exists@email.com");
            await _userManager.AddToRoleAsync(user, "Role1");
            await _userManager.AddToRoleAsync(user, "Role3");
            _context.SaveChanges();

            var updatedUserDTO = new UserDTO(user,
                new string[2]
                {
                    "Role1",
                    "Role4"
                });
            updatedUserDTO.Name = "NewName";
            updatedUserDTO.Email = "NewEmail@email.com";
            updatedUserDTO.EmailConfirmed = false;
            updatedUserDTO.LockoutEnabled = true;

            //
            // Act
            var response = await _userService.Update(user.Id, updatedUserDTO);
            var updatedUser = await _userManager.FindByIdAsync(user.Id);
            var updatedRoles = await _userManager.GetRolesAsync(user);

            //
            // Assert response
            Assert.NotNull(response);
            Assert.True(response.Success);
            Assert.NotEmpty(response.Message);

            //
            // Assert Database
            Assert.NotNull(updatedUser);
            Assert.Equal("NewName", updatedUser.DisplayName);
            Assert.Equal("NewEmail@email.com", updatedUser.Email);
            Assert.Equal(updatedUser.Email, updatedUser.UserName);
            Assert.False(updatedUser.EmailConfirmed);
            Assert.True(updatedUser.LockoutEnabled);
            Assert.Equal(5, _context.Roles.Count());
            Assert.Equal(2, updatedRoles.Count());
            Assert.DoesNotContain("RegisteredUser", updatedRoles);
            Assert.Contains("Role1", updatedRoles);
            Assert.DoesNotContain("Role2", updatedRoles);
            Assert.DoesNotContain("Role3", updatedRoles);
            Assert.Contains("Role4", updatedRoles);
        }

        [Fact]
        public async Task Delete_NotFoundFails()
        {
            //
            // Arrange
            IdentityHelper.TruncateIdentityTables(_context);

            //
            // Act
            var response = await _userService.Delete("BadID");

            //
            // Assert response
            Assert.NotNull(response);
            Assert.False(response.Success);
            Assert.NotEmpty(response.Message);
        }

        [Fact]
        public async Task Delete_ExistingUserAndTokensShouldBeDeleted()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", new string[1] { "RegisteredUser" });
            var user = await _userManager.FindByEmailAsync("exists@email.com");

            // Add a refresh token.
            user.RefreshTokens = new List<RefreshToken>()
            {
                new RefreshToken()
                {
                    UserId = user.Id,
                    Created = DateTime.UtcNow.AddDays(-8),
                    CreatedByIp = "127.0.0.1",
                    Token = "TestToken"
                }
            };

            //
            // Act
            var response = await _userService.Delete(user.Id);

            //
            // Assert response
            Assert.NotNull(response);
            Assert.True(response.Success);
            Assert.NotEmpty(response.Message);

            //
            // Assert Database
            Assert.Equal(0, _context.Users.Count());
            Assert.Equal(0, _context.RefreshTokens.Count());
        }

        [Fact]
        public async Task GetById_NotFoundShouldReturnNull()
        {
            //
            // Arrange
            IdentityHelper.TruncateIdentityTables(_context);

            //
            // Act
            var response = await _userService.GetById("BadId");

            //
            // Assert the response
            Assert.Null(response);
        }

        [Fact]
        public async Task GetById_ShouldReturnUserIncludingRoles()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password",
                new string[2] { "RegisteredUser", "Role2" });
            var user = await _userManager.FindByEmailAsync("exists@email.com");
            await _userManager.AddToRoleAsync(user, "Role2");
            _context.SaveChanges();

            //
            // Act
            var response = await _userService.GetById(user.Id);

            //
            // Assert the response
            Assert.NotNull(response);
            Assert.Equal("exists@email.com", response.Email);
            Assert.Equal(2, response.Roles.Length);
            Assert.Contains("RegisteredUser", response.Roles);
            Assert.Contains("Role2", response.Roles);
        }

        [Fact]
        public void GetAll_ShouldReturnNoneWhenNoUsers()
        {
            //
            // Arrange
            IdentityHelper.TruncateIdentityTables(_context);

            //
            // Act
            var response = _userService.GetAll();

            //
            // Assert the response
            Assert.NotNull(response);
            Assert.Empty(response);
        }

        [Fact]
        public async Task GetAll_ShouldReturnAllUsers()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password",
                new string[4]
                {
                    "RegisteredUser",
                    "Role1",
                    "Role2",
                    "Role3"
                });
            ApplicationUser secondUser = new ApplicationUser();
            secondUser.DisplayName = "DisplaySecond";
            secondUser.Email = "second@email.com";
            await _userManager.CreateAsync(secondUser);
            _context.SaveChanges();

            //
            // Act
            var response = _userService.GetAll();

            //
            // Assert the response
            Assert.NotNull(response);
            Assert.Equal(2, response.Count());
            response.Single(u => u.Email == "exists@email.com");
            response.Single(u => u.Email == "second@email.com");
        }

        [Fact]
        public async Task IsDupeEmail_ShouldReturnFalseWhenUnique()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", new string[1] { "RegisteredUser" });

            //
            // Act
            var response = await _userService.IsDupeEmail("isunique@email.com");

            //
            // Assert the response
            Assert.False(response);
        }

        [Fact]
        public async Task IsDupeEmail_ShouldReturnTrueWhenIsDuplicate()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", new string[1] { "RegisteredUser" });

            //
            // Act
            var response = await _userService.IsDupeEmail("exists@email.com");

            //
            // Assert the response
            Assert.True(response);
        }

        [Fact]
        public async Task GetRoles_ShouldReturnRoles()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", new string[1] { "RegisteredUser" });
            var id = _context.Users.First().Id;

            //
            // Act
            var response = await _userService.GetRoles(id);

            //
            // assert the response
            Assert.NotNull(response);
            response.Single(r => r == "RegisteredUser");

        }


        [Fact]
        public void GetAllRoles_ShouldReturnNoneWhenNoRoles()
        {
            //
            // Act
            var response = _userService.GetAllRoles();

            //
            // Assert the response
            Assert.NotNull(response);
            Assert.Empty(response);
        }

        [Fact]
        public async Task GetAllRoles_ShouldReturnAllRoles()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password",
                new string[3]
                {
                    "RegisteredUser",
                    "Role1",
                    "Role2"
                });

            //
            // Act
            var response = _userService.GetAllRoles();

            //
            // Assert the response
            Assert.NotNull(response);
            Assert.Equal(3, response.Length);
            Assert.Contains("RegisteredUser", response);
            Assert.Contains("Role1", response);
            Assert.Contains("Role2", response);
        }

        [Fact]
        public async Task GetRefreshTokens_NoTokensShouldReturnEmtpy()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", new string[1] { "RegisteredUser" });
            var user = await _userManager.FindByEmailAsync("exists@email.com");

            //
            // Act
            var response = _userService.GetRefreshTokens(user.Id);

            //
            // Assert the response
            Assert.NotNull(response);
            Assert.Empty(response);
        }

        [Fact]
        public async Task GetRefreshTokens_ShouldReturnUsersTokens()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", new string[1] { "RegisteredUser" });
            var user = await _userManager.FindByEmailAsync("exists@email.com");
            user.RefreshTokens = new List<RefreshToken>()
            {
                new RefreshToken() { UserId = user.Id, Token = "Token1", CreatedByIp = "127.0.0.1" },
                new RefreshToken() { UserId = user.Id, Token = "Token2", CreatedByIp = "127.0.0.1" }
            };
            _context.RefreshTokens.Add(new RefreshToken() { UserId = "NotThisUser", Token = "Token3", CreatedByIp = "127.0.0.1" });
            _context.Update(user);
            _context.SaveChanges();

            //
            // Act
            var response = _userService.GetRefreshTokens(user.Id);

            //
            // Assert the response
            Assert.Equal(2, response.Length);
            response.Single(t => t.Token == "Token1");
            response.Single(t => t.Token == "Token2");
        }

        [Fact]
        public async Task RefreshToken_NoUserForTokenShouldFail()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", new string[1] { "RegisteredUser" });

            //
            // Act
            var response = await _userService.RefreshToken("notfound", "127.0.0.1");

            //
            // Assert the response
            Assert.False(response.Success);
            Assert.NotEmpty(response.Message);
        }

        [Fact]
        public async Task RefreshToken_ShouldRevokeChildTokensIfThisTokenRevoked()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", new string[1] { "RegisteredUser" });
            var user = await _userManager.FindByEmailAsync("exists@email.com");
            user.RefreshTokens = new List<RefreshToken>()
            {
                new RefreshToken() { UserId = user.Id, Token = "GrandchildToken", CreatedByIp = "127.0.0.1", 
                    Expires = DateTime.UtcNow.AddDays(7) },
                new RefreshToken() { UserId = user.Id, Token = "ChildToken", CreatedByIp = "127.0.0.1", 
                    Expires = DateTime.UtcNow.AddDays(7),
                    Revoked = DateTime.UtcNow,
                    ReasonRevoked = "RevokeTesting",
                    ReplacedByToken = "GrandchildToken" },
                new RefreshToken() { UserId = user.Id, Token = "TokenToRefreshButRevoked", CreatedByIp = "127.0.0.1", 
                    Expires = DateTime.UtcNow.AddDays(7), 
                    Revoked = DateTime.UtcNow, 
                    ReasonRevoked = "RevokeTesting",
                    ReplacedByToken = "ChildToken" }
            };
            _context.RefreshTokens.Add(new RefreshToken() { UserId = "SomebodyElse", Token = "SomebodyElsesToken", CreatedByIp = "127.0.0.1" });
            _context.Update(user);
            _context.SaveChanges();

            //
            // Act
            var response = await _userService.RefreshToken("TokenToRefreshButRevoked", "127.0.0.1");

            //
            // Assert the response
            Assert.False(response.Success);
            Assert.NotEmpty(response.Message);

            //
            // Assert the database
            Assert.Equal(4, _context.RefreshTokens.Count());
            
            // someone else's token untouched
            var t = _context.RefreshTokens.Single(t => t.UserId == "SomebodyElse");
            Assert.NotNull(t);
            Assert.False(t.IsRevoked);

            // original token detected, no need for changes
            t = _context.RefreshTokens.Single(t => t.Token == "TokenToRefreshButRevoked");
            Assert.NotNull(t);
            Assert.True(t.IsRevoked);
            Assert.Equal("RevokeTesting", t.ReasonRevoked);
            Assert.Null(t.RevokedByIp);

            // child token detected, no need for changes
            t = _context.RefreshTokens.Single(t => t.Token == "ChildToken");
            Assert.NotNull(t);
            Assert.True(t.IsRevoked);
            Assert.Equal("RevokeTesting", t.ReasonRevoked);
            Assert.Null(t.RevokedByIp);

            // grandchild token detected and changed to revoked
            t = _context.RefreshTokens.Single(t => t.Token == "GrandchildToken");
            Assert.NotNull(t);
            Assert.True(t.IsRevoked);
            Assert.StartsWith("Attempted reuse of revoked ancestor token:", t.ReasonRevoked);
            Assert.Equal("127.0.0.1", t.RevokedByIp);
        }

        [Fact]
        public async Task RefreshToken_ShouldReplaceTokenandJwtWithSuccess()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", new string[1] { "RegisteredUser" });
            var user = await _userManager.FindByEmailAsync("exists@email.com");
            user.RefreshTokens = new List<RefreshToken>()
            {
                new RefreshToken()
                { 
                    UserId = user.Id,
                    Token = "OriginalToken",
                    Created = DateTime.UtcNow,
                    CreatedByIp = "127.0.0.1",
                    Expires = DateTime.UtcNow.AddDays(7)
                },
            };
            _context.Update(user);
            _context.SaveChanges();

            //
            // Act
            var response = await _userService.RefreshToken("OriginalToken", "127.0.0.1");

            //
            // Assert the response
            Assert.True(response.Success);
            Assert.NotEmpty(response.Message);
            Assert.NotEmpty(response.JwtToken);
            Assert.NotEmpty(response.RefreshToken);
            Assert.Contains("RegisteredUser", response.User?.Roles);

            //
            // Assert the database
            Assert.Equal(2, _context.RefreshTokens.Count());
            
            // original token
            var t = _context.RefreshTokens.Single(t => t.Token == "OriginalToken");
            Assert.NotNull(t);
            Assert.True(t.IsRevoked);
            Assert.NotNull(t.Revoked);
            Assert.Equal("Replaced by new token", t.ReasonRevoked);
            Assert.Equal("127.0.0.1", t.RevokedByIp);
            Assert.NotEmpty(t.ReplacedByToken);

            // new token
            t = _context.RefreshTokens.Single(t => t.Token == response.RefreshToken);
            Assert.NotNull(t);
            Assert.False(t.IsRevoked);// fails here
            Assert.Null(t.Revoked);
            Assert.Null(t.ReasonRevoked);
            Assert.Null(t.RevokedByIp);
            Assert.Null(t.ReplacedByToken);
            Assert.NotNull(t.CreatedByIp);
        }

        [Fact]
        public async Task RevokeToken_ShouldFailIfTokenUserNotFound()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", new string[1] { "RegisteredUser" });
            var user = await _userManager.FindByEmailAsync("exists@email.com");
            user.RefreshTokens = new List<RefreshToken>()
            {
                new RefreshToken()
                {
                    UserId = user.Id,
                    Token = "OriginalToken",
                    Created = DateTime.UtcNow,
                    CreatedByIp = "127.0.0.1",
                    Expires = DateTime.UtcNow.AddDays(7)
                },
            };
            _context.Update(user);
            _context.SaveChanges();

            //
            // Act
            var response = _userService.RevokeToken("NonExistingToken", "127.0.0.1");

            //
            // Assert the response
            Assert.NotEmpty(response);
            Assert.Contains("User not found.", response);

            //
            // Assert the database
            Assert.Equal(1, _context.RefreshTokens.Count());
        }

        [Fact]
        public async Task RevokeToken_ShouldFailIfExpiredToken()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", new string[1] { "RegisteredUser" });
            var user = await _userManager.FindByEmailAsync("exists@email.com");
            user.RefreshTokens = new List<RefreshToken>()
            {
                new RefreshToken()
                {
                    UserId = user.Id,
                    Token = "ExpiredToken",
                    Created = DateTime.UtcNow.AddDays(-1),
                    CreatedByIp = "127.0.0.1",
                    Expires = DateTime.UtcNow
                },
            };
            _context.Update(user);
            _context.SaveChanges();

            //
            // Act
            var response = _userService.RevokeToken("ExpiredToken", "127.0.0.1");

            //
            // Assert the response
            Assert.Contains("Token is not active.", response);

            //
            // Assert the database
            Assert.Equal(1, _context.RefreshTokens.Count());
            var token = await _context.RefreshTokens.FirstAsync(t => t.Token == "ExpiredToken");
            Assert.True(token.Revoked == null);
            Assert.Null(token.RevokedByIp);
            Assert.Null(token.ReasonRevoked);
            Assert.Null(token.ReplacedByToken);
        }

        [Fact]
        public async Task RevokeToken_ShouldFailIfRevokedToken()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", new string[1] { "RegisteredUser" });
            var user = await _userManager.FindByEmailAsync("exists@email.com");
            DateTime revokedDateTime = DateTime.UtcNow;
            user.RefreshTokens = new List<RefreshToken>()
            {
                new RefreshToken()
                {
                    UserId = user.Id,
                    Token = "RevokedToken",
                    Created = DateTime.UtcNow,
                    CreatedByIp = "127.0.0.1",
                    Expires = DateTime.UtcNow.AddDays(7),
                    Revoked = revokedDateTime,
                    RevokedByIp = "127.0.0.1",
                    ReasonRevoked = "testing",
                    ReplacedByToken = "replaced"
                },
            };
            _context.Update(user);
            _context.SaveChanges();

            //
            // Act
            var response = _userService.RevokeToken("RevokedToken", "127.0.0.1");

            //
            // Assert the response
            Assert.Contains("Token is not active.", response);

            //
            // Assert the database
            var token = await _context.RefreshTokens.FirstAsync(t => t.Token == "RevokedToken");
            Assert.Equal(revokedDateTime, token.Revoked);
            Assert.Equal("127.0.0.1", token.RevokedByIp);
            Assert.Equal("testing", token.ReasonRevoked);
            Assert.Equal("replaced", token.ReplacedByToken);
        }

        [Fact]
        public async Task RevokeToken_ShouldRevokeActiveToken()
        {
            //
            // Arrange
            await IdentityHelper.Seed(_context, _roleManager, _userManager, "exists@email.com", "password", new string[1] { "RegisteredUser" });
            var user = await _userManager.FindByEmailAsync("exists@email.com");
            user.RefreshTokens = new List<RefreshToken>()
            {
                new RefreshToken()
                {
                    UserId = user.Id,
                    Token = "ActiveToken",
                    Created = DateTime.UtcNow,
                    CreatedByIp = "127.0.0.1",
                    Expires = DateTime.UtcNow.AddDays(7)
                },
            };
            _context.Update(user);
            _context.SaveChanges();

            //
            // Act
            var response = _userService.RevokeToken("ActiveToken", "127.0.0.1");

            //
            // Assert the response
            Assert.Null(response);

            //
            // Assert the database
            var token = await _context.RefreshTokens.FirstAsync(t => t.Token == "ActiveToken");
            Assert.True(token.Revoked <= DateTime.UtcNow);
            Assert.Equal("127.0.0.1", token.RevokedByIp);
            Assert.Equal("Revoked without replacement", token.ReasonRevoked);
            Assert.Null(token.ReplacedByToken);
        }
    }
}
