namespace WorldCitiesAPI.Helpers
{
    using AutoMapper;
    using WorldCitiesAPI.Data.Entities;
    using WorldCitiesAPI.Data.Models.Users;
    using WorldCitiesAPI.Data.Models.Cities;
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // ApplicationUser Entity -> AuthenticateResponse
            CreateMap<ApplicationUser, AuthenticateResponse>();

            // ApplicationUser Entity -> UserDTO
            CreateMap<ApplicationUser, UserDTO>() // TODO:  Ignore Id if it is null, Identity ctor sets it
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.DisplayName));

            // UserDTO -> ApplicationUser Entity
            CreateMap<UserDTO, ApplicationUser>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.Name))
                .ForAllMembers(x => x.Condition(
                    (src, dest, prop) =>
                    {
                        // ignore null & empty string properties
                        if (prop == null) return false;
                        if (prop.GetType() == typeof(string) && string.IsNullOrEmpty((string)prop)) return false;

                        // ignore null or empty Email for UserName
                        //if (x.DestinationMember.Name == "UserName" && string.IsNullOrEmpty(src.Email)) return false;

                        return true;
                    }
                ));

            // City Entity -> CityDTO
            CreateMap<City, CityDTO>();

            /* CreateMap<UpdateRequest, UserDTO>()
                 .ForAllMembers(x => x.Condition(
                     (src, dest, prop) =>
                     {
                         // ignore null & empty string properties
                         if (prop == null) return false;
                         if (prop.GetType() == typeof(string) && string.IsNullOrEmpty((string)prop)) return false;

                         return true;
                     }
                 ));
            */

        }
    }
}
