namespace WorldCitiesAPI.Helpers
{
    using AutoMapper;
    using WorldCitiesAPI.Data.Entities;
    using WorldCitiesAPI.Data.Models.Users;
    using WorldCitiesAPI.Data.Models.Cities;
    using WorldCitiesAPI.Data.Models.AdminRegions;
    using WorldCitiesAPI.Data.Models.Countries;
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // ApplicationUser Entity -> AuthenticateResponse
            CreateMap<ApplicationUser, AuthenticateResponse>();

            // ApplicationUser Entity -> UserDTO
            CreateMap<ApplicationUser, UserDTO>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.DisplayName));

            // UserDTO -> ApplicationUser Entity
            CreateMap<UserDTO, ApplicationUser>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.Name))
                .ForAllMembers(x => x.Condition(
                    (src, dest, prop) =>
                    {
                        // ignore null & empty string properties
                        if (prop == null) 
                            return false;
                        if (prop.GetType() == typeof(string) && string.IsNullOrEmpty((string)prop)) 
                            return false;

                        // ignore null or empty Email for UserName
                        //if (x.DestinationMember.Name == "UserName" && string.IsNullOrEmpty(src.Email))
                        //  return false;

                        return true;
                    }
                ));

            // City Entity -> CityDTO
            CreateMap<City, CityDTO>();

            // CityDTO -> City Entity
            CreateMap<CityDTO, City>();

            // Country Entity -> CountryDTO
            CreateMap<Country, CountryDTO>()
                .ForMember(dest => dest.CapitalId,
                    opt => opt.MapFrom(src => src.Cities!.FirstOrDefault(c => c.Capital == "primary")!.Id))
                .ForMember(dest => dest.CapitalName,
                    opt => opt.MapFrom(src => src.Cities!.FirstOrDefault(c => c.Capital == "primary")!.Name))
                .ForMember(dest => dest.TotCities,
                    opt => opt.MapFrom(src => src.Cities!.Count))
                .ForMember(dest => dest.TotAdminRegions,
                    opt => opt.MapFrom(src => src.AdminRegions!.Count));

            // CountryDTO -> Country Entity
            CreateMap<CountryDTO, Country>();

            // AdminRegion Entity -> AdminRegionDTO
            CreateMap<AdminRegion, AdminRegionDTO>()
                .ForMember(dest => dest.CapitalId,
                    opt => opt.MapFrom(src => src.Cities!.FirstOrDefault(c => c.Capital == "admin")!.Id))
                .ForMember(dest => dest.CapitalName,
                    opt => opt.MapFrom(src => src.Cities!.FirstOrDefault(c => c.Capital == "admin")!.Name))
                .ForMember(dest => dest.TotCities,
                    opt => opt.MapFrom(src => src.Cities!.Count));

            // AdminRegionDTO -> AdminRegion Entity
            CreateMap<AdminRegionDTO, AdminRegion>();
        }
    }
}
