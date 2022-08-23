using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Moq;

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
            return new UserManager<TIdentityUser>(
                userStore,
                new Mock<IOptions<IdentityOptions>>().Object,
                new Mock<IPasswordHasher<TIdentityUser>>().Object,
                new IUserValidator<TIdentityUser>[0],
                new IPasswordValidator<TIdentityUser>[0],
                new UpperInvariantLookupNormalizer(),
                new Mock<IdentityErrorDescriber>().Object,
                new Mock<IServiceProvider>().Object,
                new Mock<ILogger<UserManager<TIdentityUser>>>().Object);
        }

    }
}
