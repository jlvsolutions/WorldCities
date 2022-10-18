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
            // UserDTO -> AuthenticateResponse
            CreateMap<UserDTO, AuthenticateResponse>();

            // RegisterRequest -> UserDTO
            CreateMap<RegisterRequest, UserDTO>();

            // UpdateRequest -> UserDTO
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

            // City Entity -> CityDTO
            CreateMap<City, CityDTO>();
        }
    }
}
