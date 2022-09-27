using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Moq;
using WorldCitiesAPI.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace WorldCitiesAPI.Tests
{
    /// <summary>
    /// WorldCitiesAPI.Tests testing helper class
    /// </summary>
    public static class IdentityHelper
    {
        public static RoleManager<TIdentityRole>  GetRoleManager<TIdentityRole>(
            IRoleStore<TIdentityRole> roleStore) where TIdentityRole : IdentityRole
        {
            return new RoleManager<TIdentityRole>(
                roleStore,
                new IRoleValidator<TIdentityRole>[0],
                new UpperInvariantLookupNormalizer(),
                new Mock<IdentityErrorDescriber>().Object,
                new Mock<ILogger<RoleManager<TIdentityRole>>>().Object);

        }

        public static UserManager<TIdentityUser> GetUserManager<TIdentityUser>(
            IUserStore<TIdentityUser> userStore) where TIdentityUser : IdentityUser
        {
            IOptions<IdentityOptions> testOptions = Options.Create<IdentityOptions>(new IdentityOptions());
            testOptions.Value.Lockout.AllowedForNewUsers = false;

            return new UserManager<TIdentityUser>(
                userStore,
                testOptions,
                new PasswordHasher<TIdentityUser>(),
                new IUserValidator<TIdentityUser>[0],
                new IPasswordValidator<TIdentityUser>[0],
                new UpperInvariantLookupNormalizer(),
                new Mock<IdentityErrorDescriber>().Object,
                new Mock<IServiceProvider>().Object,
                new Mock<ILogger<UserManager<TIdentityUser>>>().Object);
        }

        public static void TruncateIdentityTables(ApplicationDbContext context)
        {
            foreach (ApplicationUser user in context.Users)
                context.Users.Remove(user);
            foreach (IdentityRole role in context.Roles)
                context.Roles.Remove(role);
            foreach (IdentityUserRole<string> userRole in context.UserRoles)
                context.UserRoles.Remove(userRole);
            foreach (RefreshToken refreshToken in context.RefreshTokens)
                context.RefreshTokens.Remove(refreshToken);
            context.SaveChanges();
        }

        public static async Task Seed(
            ApplicationDbContext context,
            RoleManager<IdentityRole> roleManager, 
            UserManager<ApplicationUser> userManager, 
            string email = "email@email.com", 
            string password = "password",
            string[]? roles = null)
        {
            TruncateIdentityTables(context);

            if (roles != null)
                foreach (string role in roles)
                    await roleManager.CreateAsync(new IdentityRole(role));

            var user = new ApplicationUser()
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = email,
                Email = email,
                DisplayName = $"DisplayName:{email}",
                EmailConfirmed = true,
                LockoutEnabled = false
            };
            await userManager.CreateAsync(user, password);
            context.SaveChanges();
        }

    }
}
