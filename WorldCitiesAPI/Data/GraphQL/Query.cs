using Microsoft.EntityFrameworkCore;
using WorldCitiesAPI.Data.Entities;
using WorldCitiesAPI.Data.Models;
using WorldCitiesAPI.Data.Models.Cities;

namespace WorldCitiesAPI.Data.GraphQL
{
    public class Query
    {
        /// <summary>
        /// Gets all Cities
        /// </summary>
        /// <param name="context">ApplicationDbContext</param>
        /// <returns></returns>
        [Serial]
        [UsePaging]
        [UseFiltering]
        [UseSorting]
        public IQueryable<City> GetCities([Service] ApplicationDbContext context) => context.Cities;

        /// <summary>
        /// Gets all Countries.
        /// </summary>
        /// <param name="context">ApplicationDbContext</param>
        /// <returns></returns>
        [Serial]
        [UsePaging]
        [UseFiltering]
        [UseSorting]
        public IQueryable<Country> GetCountries([Service] ApplicationDbContext context) => context.Countries;

        /// <summary>
        /// Gets all Cites (with ApiResult and DTO support).
        /// </summary>
        /// <param name="context"></param>
        /// <param name="pageIndex"></param>
        /// <param name="pageSize"></param>
        /// <param name="sortColumn"></param>
        /// <param name="sortOrder"></param>
        /// <param name="filterColumn"></param>
        /// <param name="filterQuery"></param>
        /// <returns></returns>
        [Serial]
        public async Task<ApiResult<CityDTO>> GetCitiesApiResult([Service] ApplicationDbContext context,
            int pageIndex = 0,
            int pageSize = 0,
            string? sortColumn = null,
            string? sortOrder = null,
            string? filterColumn = null,
            string? filterQuery = null)
        {
            return await ApiResult<CityDTO>.CreateAsync(
                context.Cities.AsNoTracking()
                    .Select(c => new CityDTO()
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Lat = c.Lat,
                        Lon = c.Lon,
                        Population = c.Population,
                        CountryId = c.CountryId,
                        CountryName = c.Country!.Name

                    }),
                pageIndex, pageSize, sortColumn, sortOrder, filterColumn, filterQuery);
        }
    }
}
