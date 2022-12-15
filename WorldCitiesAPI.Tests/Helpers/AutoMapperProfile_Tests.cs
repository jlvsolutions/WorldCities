using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorldCitiesAPI.Data.Entities;
using WorldCitiesAPI.Data.Models.Cities;
using WorldCitiesAPI.Data.Models.AdminRegions;
using WorldCitiesAPI.Data.Models.Countries;
using WorldCitiesAPI.Data.Models.Users;
using AutoMapper;
using WorldCitiesAPI.Helpers;

namespace WorldCitiesAPI.Tests.Helpers
{
    public class AutoMapperProfile_Tests
    {
        private readonly IMapper _mapper;
        private readonly ApplicationUser _applicationUserEntity;
        private readonly UserDTO _userDTO;
        private readonly City _cityEntity;
        private readonly City _cityEntity2;
        private readonly City _cityEntity3;
        private readonly CityDTO _cityDTO;
        private readonly AdminRegion _adminRegionEntity;
        private readonly AdminRegion _adminRegionEntity2;
        private readonly AdminRegionDTO _adminRegionDTO;
        private readonly Country _countryEntity;
        private readonly CountryDTO _countryDTO;

        public AutoMapperProfile_Tests()
        {
            // Create an IMapper instance for the service
            MapperConfiguration mapperConfig = new MapperConfiguration(cfg =>
                cfg.AddProfile(new AutoMapperProfile()));
            _mapper = new Mapper(mapperConfig);

            _applicationUserEntity = new ApplicationUser()
            {
                Id = "Id",
                UserName = "UserName",
                DisplayName = "DisplayName",
                Email = "Email",
                EmailConfirmed = true,
                LockoutEnabled = true
            };

            _userDTO = new UserDTO()
            {
                Id = "IdDTO",
                Name = "NameDTO",
                Email = "EmailDTO",
                EmailConfirmed = true,
                LockoutEnabled = true,
                NewPassword = "NewPasswordDTO",
                Roles = new string[2] { "RoleOneDTO", "RoleTwoDTO" },
                JwtToken = "JWtTokenDTO",
                RefreshToken = "RefreshTokenDTO"
            };

            _cityEntity = new City()
            {
                Id = 11,
                Name = "CapitalName",
                Lat = 1.234M,
                Lon = 4.567M,
                Population = 10D,
                Capital = "primary",
                SimpleMapsId = 1234567890,
                AdminRegionId = 67,
                CountryId = 2
            };

            _cityEntity2 = new City()
            {
                Id = 22,
                Name = "AdminName2",
                Lat = 8.234M,
                Lon = 9.567M,
                Population = 15D,
                Capital = null,
                SimpleMapsId = 1234567899,
                AdminRegionId = 68,
                CountryId = 3
            };

            _cityEntity3 = new City()
            {
                Id = 33,
                Name = "CityName3",
                Lat = 8.234M,
                Lon = 9.567M,
                Population = 15D,
                Capital = "admin",
                SimpleMapsId = 1234567833,
                AdminRegionId = 69,
                CountryId = 3
            };

            _cityDTO = new CityDTO()
            {
                Id = 77,
                Name = "CityDTOName",
                Lat = 7.890M,
                Lon = 12.345M,
                Population = 777,
                Capital = "primary",
                AdminRegionId = 7777,
                AdminRegionName = "Admin Region Name",
                CountryId = 77777,
                CountryName = "Country Name"
            };

            _adminRegionEntity = new AdminRegion()
            {
                Id = 6,
                Name = "Big State",
                Code = "BS",
                CountryId = 99,
                Cities = new[] { _cityEntity, _cityEntity2, _cityEntity3 },
            };
            _cityEntity.AdminRegion = _adminRegionEntity;

            _adminRegionDTO = new AdminRegionDTO()
            {
                Id = 88,
                Name = "Admin Region DTO",
                Code = "AD",
                TotCities = 80,
                CapitalId = 888,
                CapitalName = "Capital DTO Name",
                CountryId = 8888,
                CountryName = "Country DTO Name"
            };

            _adminRegionEntity2 = new AdminRegion()
            {
                Id = 66,
                Name = "Bigger State",
                Code = "BG",
                CountryId = 7,
                Country = null
            };

            _countryEntity = new Country() 
            { 
                Id = 2, 
                Name = "CountryName", 
                ISO2 = "ISO2", 
                ISO3 = "ISO3", 
                Cities = new[] { _cityEntity, _cityEntity2, _cityEntity3 },
                AdminRegions = new[] { _adminRegionEntity, _adminRegionEntity2 }
            };
            _cityEntity.Country = _countryEntity;
            _adminRegionEntity.Country = _countryEntity;

            _countryDTO = new CountryDTO()
            {
                Id = 99,
                Name = "Country DTO Name",
                ISO2 = "II",
                ISO3 = "JJJ",
                CapitalId = 999,
                CapitalName = "Capital Name DTO",
                TotAdminRegions = 90,
                TotCities = 909
            };
        }

        [Fact]
        public void ApplicationUser_ShouldMapTo_UserDTO()
        {
            // Act
            var user = _mapper.Map<UserDTO>(_applicationUserEntity);

            // Assert
            Assert.Equal("Id", user.Id);
            Assert.Equal("DisplayName", user.Name);
            Assert.Equal("Email", user.Email);
            Assert.True(user.EmailConfirmed);
            Assert.True(user.LockoutEnabled);
            Assert.Null(user.JwtToken);
            Assert.Null(user.RefreshToken);
            Assert.Null(user.NewPassword);
            Assert.Null(user.Roles);
        }

        [Fact]
        public void UserDTO_ShouldMapTo_ApplicationUser()
        {
            // Act
            var appUser = _mapper.Map<ApplicationUser>(_userDTO);

            // Assert
            Assert.Equal("IdDTO", appUser.Id);
            Assert.Equal("NameDTO", appUser.DisplayName); //TODO:  and this one too...
            Assert.Equal("EmailDTO", appUser.Email);
            Assert.Equal("EmailDTO", appUser.UserName); // TODO:  Need to add some logic to AutoMapper Profile for this one!:)
            Assert.True(appUser.EmailConfirmed);
            Assert.True(appUser.LockoutEnabled);
            Assert.Null(appUser.RefreshTokens);

            Assert.Null(appUser.NormalizedUserName);
            Assert.Null(appUser.NormalizedEmail);
            Assert.Null(appUser.PasswordHash);
            Assert.NotEmpty(appUser.SecurityStamp);
            Assert.NotEmpty(appUser.ConcurrencyStamp);
            Assert.Null(appUser.PhoneNumber);
            Assert.False(appUser.PhoneNumberConfirmed);
            Assert.False(appUser.TwoFactorEnabled);
            Assert.Null(appUser.LockoutEnd);
            Assert.Equal(0, appUser.AccessFailedCount);

            Assert.Equal("EmailDTO", appUser.ToString());
        }

        [Fact]
        public void UserDTO_ShouldIgnoreNullEmptyValues_ApplicationUser()
        {
            // Arrange
            UserDTO userDTO = new UserDTO() { Id = "", Email = null!, Name = "nameDTO" };
            ApplicationUser applicationUser = new ApplicationUser() { Id = "prevId", Email = "prevEmail", DisplayName = "prevName", UserName = "prevUserName" };

            // Act
            _mapper.Map(userDTO, applicationUser);

            // Assert
            Assert.Equal("prevId", applicationUser.Id);
            Assert.Equal("prevEmail", applicationUser.Email);
            Assert.Equal("prevUserName", applicationUser.UserName);
            Assert.Equal("nameDTO", applicationUser.DisplayName);
        }

        [Fact]
        public void UserDTO_2ParamsMapShouldMapAndPreserveExisting_ApplicationUser()
        {
            // Arrange
            ApplicationUser previousUser = new ApplicationUser()
            {
                DisplayName = "prevDisplayName",
                RefreshTokens = new List<RefreshToken>() { new RefreshToken() { Token = "prevToken1" }, new RefreshToken() { Token = "prevToken2" } },
                UserName = "prevUserName",
                NormalizedUserName = "prevNormalizedUserName",
                Email = "prevEmail",
                NormalizedEmail = "prevNormalizedEmail",
                EmailConfirmed = false,
                PasswordHash = "prevPasswordHash",
                SecurityStamp = "prevSecurityStamp",
                ConcurrencyStamp = "prevConcurrencyStamp",
                PhoneNumber = "prevPhoneNumber",
                PhoneNumberConfirmed = false,
                TwoFactorEnabled = false,
                LockoutEnd = new DateTimeOffset(),
                LockoutEnabled = false,
                AccessFailedCount = 55
            };

            // Act
            _mapper.Map(_userDTO, previousUser);

            // Assert
            Assert.Equal("IdDTO", previousUser.Id);
            Assert.Equal("NameDTO", previousUser.DisplayName);
            Assert.Equal("EmailDTO", previousUser.Email);
            Assert.Equal("EmailDTO", previousUser.UserName);
            Assert.Equal("prevNormalizedEmail", previousUser.NormalizedEmail);
            Assert.Equal("prevNormalizedUserName", previousUser.NormalizedUserName);
            Assert.True(previousUser.EmailConfirmed);
            Assert.True(previousUser.LockoutEnabled);
            Assert.Equal(2, previousUser.RefreshTokens.Count);
            Assert.Equal("prevToken1", previousUser.RefreshTokens[0].Token);
            Assert.Equal("prevToken2", previousUser.RefreshTokens[1].Token);
            Assert.Equal("prevPasswordHash", previousUser.PasswordHash);
            Assert.Equal("prevSecurityStamp", previousUser.SecurityStamp);
            Assert.Equal("prevConcurrencyStamp", previousUser.ConcurrencyStamp);
            Assert.Equal("prevPhoneNumber", previousUser.PhoneNumber);
            Assert.False(previousUser.PhoneNumberConfirmed);
            Assert.False(previousUser.TwoFactorEnabled);
            Assert.NotNull(previousUser.LockoutEnd);
            Assert.Equal(55, previousUser.AccessFailedCount);

            Assert.Equal("EmailDTO", previousUser.ToString());
        }

        [Fact]
        public void CityDTO_ShouldMapTo_City()
        {
            // Act
            City city = _mapper.Map<City>(_cityDTO);

            // Assert
            Assert.Equal(77, city.Id);
            Assert.Equal("CityDTOName", city.Name);
            Assert.Equal(7.890M, city.Lat);
            Assert.Equal(12.345M, city.Lon);
            Assert.Equal(777, city.Population);
            Assert.Equal("primary", city.Capital);
            Assert.Equal(7777, city.AdminRegionId);
            Assert.Equal(77777, city.CountryId);

            Assert.Equal(0L, city.SimpleMapsId);
            Assert.Null(city.AdminRegion);
            Assert.Null(city.Country);
        }
        [Fact]
        public void CityDTO_ShouldMapTo_CityWithNulls()
        {
            // Arrange
            _cityDTO.AdminRegionId = null;
            _cityDTO.Capital = null;

            // Act
            City city = _mapper.Map<City>(_cityDTO);

            // Assert
            Assert.Equal(77, city.Id);
            Assert.Equal("CityDTOName", city.Name);
            Assert.Equal(7.890M, city.Lat);
            Assert.Equal(12.345M, city.Lon);
            Assert.Equal(777, city.Population);
            Assert.Null(city.Capital);
            Assert.Null(city.AdminRegionId);
            Assert.Equal(77777, city.CountryId);

            Assert.Equal(0L, city.SimpleMapsId);
            Assert.Null(city.AdminRegion);
            Assert.Null(city.Country);
        }

        [Fact]
        public void CityEntity_ShouldMapTo_CityDTO()
        {
            // Act
            var city = _mapper.Map<CityDTO>(_cityEntity);

            // Assert
            Assert.Equal(11, city.Id);
            Assert.Equal("CapitalName", city.Name);
            Assert.Equal(1.234M, city.Lat);
            Assert.Equal(4.567M, city.Lon);
            Assert.Equal(10D, city.Population);
            Assert.Equal("primary", city.Capital);
            Assert.Equal(67, city.AdminRegionId);
            Assert.Equal("Big State", city.AdminRegionName);
            Assert.Equal(2, city.CountryId);
            Assert.Equal("CountryName", city.CountryName);
        }

        [Fact]
        public void CityEntity_ShouldMapTo_CityDTOWithNulls()
        {
            // Arrange
            _cityEntity.Capital = null;
            _cityEntity.AdminRegionId = null;
            _cityEntity.AdminRegion = null;

            // Act
            var city = _mapper.Map<CityDTO>(_cityEntity);

            // Assert
            Assert.Equal(11, city.Id);
            Assert.Equal("CapitalName", city.Name);
            Assert.Equal(1.234M, city.Lat);
            Assert.Equal(4.567M, city.Lon);
            Assert.Equal(10D, city.Population);
            Assert.Null(city.Capital);
            Assert.Null(city.AdminRegionId);
            Assert.Null(city.AdminRegionName);
            Assert.Equal(2, city.CountryId);
            Assert.Equal("CountryName", city.CountryName);
        }

        [Fact]
        public void CountryEntity_ShouldMapTo_CountryDTO()
        {
            // Act
            var country = _mapper.Map<CountryDTO>(_countryEntity);

            // Assert
            Assert.Equal(2, country.Id);
            Assert.Equal("CountryName", country.Name);
            Assert.Equal("ISO2", country.ISO2);
            Assert.Equal("ISO3", country.ISO3);
            Assert.Equal(11, country.CapitalId);
            Assert.Equal("CapitalName", country.CapitalName);
            Assert.Equal(2, country.TotAdminRegions);
            Assert.Equal(3, country.TotCities);
        }

        [Fact]
        public void CountryEntity_ShouldMapTo_CountryDTOWithNoCapital()
        {
            // Arrange
            _cityEntity.Capital = null;
            _countryEntity.Cities = new[] { _cityEntity, _cityEntity2, _cityEntity3 };

            // Act
            var country = _mapper.Map<CountryDTO>(_countryEntity);

            // Assert
            Assert.Equal(2, country.Id);
            Assert.Equal("CountryName", country.Name);
            Assert.Equal("ISO2", country.ISO2);
            Assert.Equal("ISO3", country.ISO3);
            Assert.Null(country.CapitalId);
            Assert.Null(country.CapitalName);
            Assert.Equal(2, country.TotAdminRegions);
            Assert.Equal(3, country.TotCities);
        }

        [Fact]
        public void CoungryDTO_ShouldMapTo_CountryEntity()
        {
            // Act
            Country c = _mapper.Map<Country>(_countryDTO);

            // Assert
            Assert.Equal(99, c.Id);
            Assert.Equal("Country DTO Name", c.Name);
            Assert.Equal("II", c.ISO2);
            Assert.Equal("JJJ", c.ISO3);
            Assert.Null(c.Cities);
            Assert.Null(c.AdminRegions);
        }

        [Fact]
        public void AdminRegionEntity_ShouldMapTo_AdminRegionDTO()
        {
            // Act
            var adminRegion = _mapper.Map<AdminRegionDTO>(_adminRegionEntity);

            // Assert
            Assert.Equal(6, adminRegion.Id);
            Assert.Equal("Big State", adminRegion.Name);
            Assert.Equal("BS", adminRegion.Code);
            Assert.Equal(3, adminRegion.TotCities);
            Assert.Equal(33, adminRegion.CapitalId);
            Assert.Equal("CityName3", adminRegion.CapitalName);
            Assert.Equal(99, adminRegion.CountryId);
            Assert.Equal("CountryName", adminRegion.CountryName);
        }

        [Fact]
        public void AdminRegionEntity_ShouldMapTo_AdminRegionDTOWithNulls()
        {
            // Arrange
            _adminRegionEntity.Code = null;

            // Act
            var adminRegion = _mapper.Map<AdminRegionDTO>(_adminRegionEntity);

            // Assert
            Assert.Equal(6, adminRegion.Id);
            Assert.Equal("Big State", adminRegion.Name);
            Assert.Null(adminRegion.Code);
            Assert.Equal(3, adminRegion.TotCities);
            Assert.Equal(33, adminRegion.CapitalId);
            Assert.Equal("CityName3", adminRegion.CapitalName);
            Assert.Equal(99, adminRegion.CountryId);
            Assert.Equal("CountryName", adminRegion.CountryName);
        }

        [Fact]
        public void AdminRegionDTO_ShouldMapTo_AdminRegionEntity()
        {
            // Act
            AdminRegion ar = _mapper.Map<AdminRegion>(_adminRegionDTO);

            // Assert
            Assert.Equal(88, ar.Id);
            Assert.Equal("Admin Region DTO", ar.Name);
            Assert.Equal("AD", ar.Code);
            Assert.Equal(8888, ar.CountryId);
            Assert.Null(ar.Cities);
            Assert.Null(ar.Country);
        }

        [Fact]
        public void AdminRegionDTO_ShouldMapTo_AdminRegionEntityWithNulls()
        {
            // Arrange
            _adminRegionDTO.Code = null;

            // Act
            AdminRegion ar = _mapper.Map<AdminRegion>(_adminRegionDTO);

            // Assert
            Assert.Equal(88, ar.Id);
            Assert.Equal("Admin Region DTO", ar.Name);
            Assert.Null(ar.Code);
            Assert.Equal(8888, ar.CountryId);
            Assert.Null(ar.Cities);
            Assert.Null(ar.Country);
        }
    }
}
