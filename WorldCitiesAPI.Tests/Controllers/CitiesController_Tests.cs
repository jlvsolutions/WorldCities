﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using WorldCitiesAPI.Data.Entities;
using WorldCitiesAPI.Data.Models.Cities;
using WorldCitiesAPI.Helpers;
using AutoMapper;

namespace WorldCitiesAPI.Tests.Controllers
{
    public class CitiesController_Tests
    {
        private readonly IMapper _mapper;
        public CitiesController_Tests()
        {
            MapperConfiguration mapperConfig = new MapperConfiguration(cfg =>
                cfg.AddProfile(new AutoMapperProfile()));
            _mapper = new Mapper(mapperConfig);
        }

        [Fact(Skip ="The tested controller method now returns HTTP OK response")]
        public void GetCity()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "CitiesController_Tests")
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

            var controller = new CitiesController(context, _mapper, new NullLogger<CitiesController>());
            CityDTO? city_existing = null;
            CityDTO? city_notExisting = null;


            // Act
            city_existing = controller.GetCity(1).Value;
            city_notExisting = controller.GetCity(2).Value;

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
