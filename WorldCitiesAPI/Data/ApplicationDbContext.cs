using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WorldCitiesAPI.Data.Entities;

namespace WorldCitiesAPI.Data
{
    //public class ApplicationDbContext : DbContext
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {

        public ApplicationDbContext() : base()
        {
        }

        public ApplicationDbContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<City> Cities => Set<City>();
        public DbSet<Country> Countries => Set<Country>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    }
}
