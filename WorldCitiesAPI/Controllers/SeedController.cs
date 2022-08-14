using System.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using WorldCitiesAPI.Data;
using WorldCitiesAPI.Data.Models;

namespace WorldCitiesAPI.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class SeedController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public SeedController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult> Import()
        {
            // Prevents non-development environments from running this method
            if (!_env.IsDevelopment())
                throw new SecurityException("Not Allowed");

            var path = Path.Combine(_env.ContentRootPath, "Data/Source/WorldCities.xlsx");
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

                var countryId = countriesByName[countryName].Id;

                // Skip this city if it already exists in the database
                if (cities.ContainsKey((Name: name, Lat: lat, Lon: lon, CountryId: countryId)))
                    continue;

                // Create the city entity and fill it with xlsx data
                var city = new City { Name = name, Lat = lat, Lon = lon, CountryId = countryId};

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
    }
}
