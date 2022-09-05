using System.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using WorldCitiesAPI.Data;
using WorldCitiesAPI.Data.Models;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using System.IO;

namespace WorldCitiesAPI.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize(Roles = "Administrator")]
    public class SeedController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<SeedController> _logger;

        public SeedController(
            ApplicationDbContext context, 
            RoleManager<IdentityRole> roleManager, 
            UserManager<ApplicationUser> userManager,
            IWebHostEnvironment env, 
            IConfiguration configuration,
            ILogger<SeedController> logger)
        {
            _context = context;
            _env = env;
            _roleManager = roleManager;
            _userManager = userManager;
            _configuration = configuration;
            _logger = logger;

            _logger.LogInformation("SeedController Ctor()");
        }

        /// <summary>
        /// This is for Initial migration
        /// </summary>
        /// <returns></returns>
        /// <exception cref="SecurityException"></exception>
        [HttpGet]
        public async Task<ActionResult> Import()
        {
            _logger.LogInformation("SeedController: Import()");

            // Prevents non-development environments from running this method
            if (!_env.IsDevelopment())
                throw new SecurityException("Not Allowed");

            var path = System.IO.Path.Combine(_env.ContentRootPath, "Data/Source/WorldCities.xlsx");
            using var stream = System.IO.File.OpenRead(path);
            using var excelPackage = new ExcelPackage(stream);

            // Get the first worksheet
            var worksheet = excelPackage.Workbook.Worksheets[0];

            // Define how many rows we want to process
            var nEndRow = worksheet.Dimension.End.Row;

            // Initialize the record counters
            var numberOfCountriesAdded = 0;
            var numberOfCitiesAdded = 0;

            // Create a lookup dictionary containing all the countries already existing
            // into the Database (it will be empty on first run).
            var countriesByName = _context.Countries
                .AsNoTracking()
                .ToDictionary(x => x.Name, StringComparer.OrdinalIgnoreCase);

            // Iterate through all rows, skipping the first one
            for (int nRow = 2; nRow <= nEndRow; nRow++)
            {
                var row = worksheet.Cells[nRow, 1, nRow, worksheet.Dimension.End.Column];
             
                var countryName = row[nRow, 5].GetValue<string>();
                var iso2 = row[nRow, 6].GetValue<string>();
                var iso3 = row[nRow, 7].GetValue<string>();

                // Skip this country if it already exists in the database
                if (countriesByName.ContainsKey(countryName))
                    continue;

                // Create the country entity and fill it with xlsx data
                var country = new Country { Name = countryName, ISO2 = iso2, ISO3 = iso3 };

                // Add the new country to the DB context
                await _context.Countries.AddAsync(country);

                // Store the country in our Lookup to retrieve its Id later on
                countriesByName.Add(countryName, country);

                numberOfCountriesAdded++;
            }

            // Save all the countries into the database
            if (numberOfCountriesAdded > 0)
                await _context.SaveChangesAsync();

            // Create a Lookup dictionary containing all the cities already existing
            // into the Database (it will be empty on first run).
            var cities = _context.Cities
                .AsNoTracking()
                .ToDictionary(x => (
                    Name: x.Name,
                    Lat: x.Lat,
                    Lon: x.Lon,
                    CountryId: x.CountryId));

            // Iterate through all rows, skipping the first one
            for (int nRow = 2; nRow <= nEndRow; nRow++)
            {
                var row = worksheet.Cells[nRow, 1, nRow, worksheet.Dimension.End.Column];

                var name = row[nRow, 1].GetValue<string>();
                var nameAscii = row[nRow, 2].GetValue<string>();
                var lat = row[nRow, 3].GetValue<decimal>();
                var lon = row[nRow, 4].GetValue<decimal>();
                var countryName = row[nRow, 5].GetValue<string>();
                var population = row[nRow, 10].GetValue<double>();

                var countryId = countriesByName[countryName].Id;

                // Skip this city if it already exists in the database
                if (cities.ContainsKey((Name: name, Lat: lat, Lon: lon, CountryId: countryId)))
                    continue;

                // Create the city entity and fill it with xlsx data
                var city = new City { Name = name, Lat = lat, Lon = lon, Population = population, CountryId = countryId};

                // Add the city to the DB context.   Why not async like the Countries was done?
                _context.Cities.Add(city);

                // Increment the counter
                numberOfCitiesAdded++;
            }

            // Save all the cities into the Database
            if (numberOfCitiesAdded > 0)
                await _context.SaveChangesAsync();

            return new JsonResult(new { Cities = numberOfCitiesAdded, Countries = numberOfCountriesAdded });
        }


        /// <summary>
        /// This is for Migration1
        /// </summary>
        /// <returns></returns>
        /// <exception cref="SecurityException"></exception>
        [HttpGet]
        public async Task<ActionResult> ImportPopulations()
        {
            _logger.LogInformation("SeedController:  ImportPopulations()");

            // Prevents non-development environments from running this method
            if (!_env.IsDevelopment())
                throw new SecurityException("Not Allowed");

            var path = System.IO.Path.Combine(_env.ContentRootPath, "Data/Source/WorldCities.xlsx");
            using var stream = System.IO.File.OpenRead(path);
            using var excelPackage = new ExcelPackage(stream);

            // Get the first worksheet
            var worksheet = excelPackage.Workbook.Worksheets[0];

            // Define how many rows we want to process
            var nEndRow = worksheet.Dimension.End.Row;

            // Initialize the record counters
            var numberOfCitiesUpdated = 0;

            // Iterate through all rows, skipping the first one
            for (int nRow = 2; nRow <= nEndRow; nRow++)
            {
                var row = worksheet.Cells[nRow, 1, nRow, worksheet.Dimension.End.Column];

                var name = row[nRow, 1].GetValue<string>();
                var lat = row[nRow, 3].GetValue<decimal>();
                var lon = row[nRow, 4].GetValue<decimal>();
                var population = row[nRow, 10].GetValue<double>();

                var dbCity = _context.Cities.FirstOrDefault(c => c.Name == name && c.Lat == lat && c.Lon == lon);
                if (dbCity != null)
                {
                    dbCity.Population = population;
                    _context.Cities.Update(dbCity);
                    numberOfCitiesUpdated++;
                }
            }
            
            // Save all the updated cities into the Database
            if (numberOfCitiesUpdated > 0)
                    await _context.SaveChangesAsync();
            
            return new JsonResult(new { Cities = numberOfCitiesUpdated });
        }

        [HttpGet]
        public async Task<ActionResult> CreateDefaultUsers()
        {
            _logger.LogInformation("SeedController: CreateDefaultUsers()");

            // setup the default role names
            string role_RegisteredUser = "RegisteredUser";
            string role_Administrator = "Administrator";

            // create the default roles (if they don't exist yet)
            if (await _roleManager.FindByNameAsync(role_RegisteredUser) == null)
            {
                await _roleManager.CreateAsync(new IdentityRole(role_RegisteredUser));
                _logger.LogInformation("CreateDefaultUsers:  Added {role_RegisteredUser} Role.", role_RegisteredUser);
            }

            if (await _roleManager.FindByNameAsync(role_Administrator) == null)
            {
                await _roleManager.CreateAsync(new IdentityRole(role_Administrator));
                _logger.LogInformation("CreateDefaultUsers:  Added {role_Administrator} Role.", role_Administrator);
            }

            // create a List to track the newly added users
            var addedUserList = new List<ApplicationUser>();

            // check if the admin user already exists
            var email_Admin = "admin@email.com";
            if (await _userManager.FindByNameAsync(email_Admin) == null)
            {
                // create a new admin ApplicationUser account
                var user_Admin = new ApplicationUser()
                {
                    SecurityStamp = Guid.NewGuid().ToString(),
                    UserName = email_Admin,
                    Email = email_Admin
                };

                // insert the admin user into the DB
                await _userManager.CreateAsync(user_Admin, _configuration["DefaultPasswords:Administrator"]);

                // assign the "RegisteredUser" and "Administrator" roles
                await _userManager.AddToRoleAsync(user_Admin, role_RegisteredUser);
                await _userManager.AddToRoleAsync(user_Admin, role_Administrator);

                // confirm the e-mail and remove Lockout
                user_Admin.EmailConfirmed = true;
                user_Admin.LockoutEnabled = false;

                addedUserList.Add(user_Admin);
            }

            // check if the standard user already exists
            var email_User = "user@email.com";
            if (await _userManager.FindByEmailAsync(email_User) == null)
            {
                // create a new standard ApplicationUser account
                var user_User = new ApplicationUser()
                {
                    SecurityStamp = Guid.NewGuid().ToString(),
                    UserName = email_User,
                    Email = email_User
                };

                // insert the standard user into the DB
                await _userManager.CreateAsync(user_User, _configuration["DefaultPasswords:RegisteredUser"]);

                // assign the "RegisteredUser" role
                await _userManager.AddToRoleAsync(user_User, role_RegisteredUser);

                // confirm the e-mail and remove Lockout
                user_User.EmailConfirmed = true;
                user_User.LockoutEnabled = false;

                // add the standard user to the added users list
                addedUserList.Add(user_User);
            }

            // if we added at least one user, persist the changes into the DB
            if (addedUserList.Count > 0)
                await _context.SaveChangesAsync();

            _logger.LogInformation("SeedController: CreateDefaultUsers():  {Count} Users added.", addedUserList.Count.ToString());

            return new JsonResult(new 
            { 
                Count = addedUserList.Count, 
                Users = addedUserList 
            });

        }
    }
}
