using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WorldCitiesAPI.Data.Entities;

namespace WorldCitiesAPI.Tests.Controllers
{
    public class CitiesController_Tests
    {
        [Fact]
        public async Task GetCity()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "WorldCities")
                .Options;
            using var context = new ApplicationDbContext(options);

            context.Add(new City()
            {
                Id = 1,
                CountryId = 2,
                Lat = 3,
                Lon = 4,
                Population = 5,
                Name = "TestCity1"
            });
            context.SaveChanges();

            var controller = new CitiesController(context); // TODO: Also need to test with a mocked ILogger
            City? city_existing = null;
            City? city_notExisting = null;


            // Act
            city_existing = (await controller.GetById(1)).Value;
            city_notExisting = (await controller.GetById(2)).Value;

            // Assert
            Assert.NotNull(city_existing);
            Assert.Equal(1, city_existing?.Id);
            Assert.Equal(2, city_existing?.CountryId);
            Assert.Equal(3, city_existing?.Lat);
            Assert.Equal(4, city_existing?.Lon);
            Assert.Equal(5, city_existing?.Population);
            Assert.Equal("TestCity1", city_existing?.Name);

            Assert.Null(city_notExisting);
        }
    }
}
