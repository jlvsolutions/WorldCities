using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorldCitiesAPI.Data.Entities;
using WorldCitiesAPI.Data.Models.Cities;
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
        private readonly Country _countryEntity;

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
                Id = 1,
                Name = "CityName",
                Lat = 1.234M,
                Lon = 4.567M,
                Population = 10D,
                CountryId = 2,
                Country = null
            };

            _countryEntity = new Country() 
            { 
                Id = 2, 
                Name = "CountryName", 
                ISO2 = "ISO2", 
                ISO3 = "ISO3", 
                Cities = new[] { _cityEntity }
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
            Assert.Equal("NameDTO", appUser.DisplayName); // and this one too...
            Assert.Equal("EmailDTO", appUser.Email);
            Assert.Equal("EmailDTO", appUser.UserName); // Need to add some logic to AutoMapper Profile for this one!:)
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
        public void CityEntity_ShouldMapTo_CityDTO()
        {
            // Act
            var city = _mapper.Map<CityDTO>(_cityEntity);

            // Assert
            Assert.Equal(1, city.Id);
            Assert.Equal("CityName", city.Name);
            Assert.Equal(1.234M, city.Lat);
            Assert.Equal(4.567M, city.Lon);
            Assert.Equal(10D, city.Population);
            Assert.Equal(2, city.CountryId);
            Assert.Null(city.CountryName);
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
        }
    }
}
