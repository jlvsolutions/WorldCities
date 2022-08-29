using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorldCitiesAPI.Data;
using WorldCitiesAPI.Data.Models;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;

namespace WorldCitiesAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CitiesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CitiesController>? _logger;

        public CitiesController(ApplicationDbContext context, ILogger<CitiesController>? logger = null)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Cities
        // GET: api/Cities/?pageIndex=0&pageSize=10
        // GET: api/Cities/?pageIndex=0&pageSize=10&sortColumn=name&sortOrder=asc
        // GET: api/Cities/?pageIndex=0&pageSize=10&sortColumn=name&sortOrder=asc&filterColumn=name&filterQuery=query
        [HttpGet]
        public async Task<ActionResult<ApiResult<CityDTO>>> GetCities(
            int pageIndex = 0, 
            int pageSize = 10,
            string? sortColumn = null,
            string? sortOrder = null,
            string? filterColumn = null,
            string? filterQuery = null)
        {
            _logger?.LogInformation("Entering GetCities. PageIndex: {pageIndex}, SortOrder: {sortOrder}", pageIndex, sortOrder);

            return await ApiResult<CityDTO>.CreateAsync(
                        _context.Cities.AsNoTracking()
                        .Select(c => new CityDTO()
                        {
                            Id = c.Id,
                            Name = c.Name,
                            Lat = c.Lat,
                            Lon = c.Lon,
                            Population = c.Population,
                            CountryId = c.Country!.Id,
                            CountryName = c.Country!.Name
                        }),
                        pageIndex,
                        pageSize,
                        sortColumn,
                        sortOrder,
                        filterColumn,
                        filterQuery);
        }

        // GET: api/Cities/5
        [HttpGet("{id}")]
        public async Task<ActionResult<City>> GetCity(int id) // TODO:  Change to CityDTO
        {
            _logger?.LogInformation("Entering GetCity. Id: {id}", id);
            if (_context.Cities == null)
          {
              return NotFound();
          }
            var city = await _context.Cities.FindAsync(id);

            if (city == null)
            {
                return NotFound();
            }

            return city;
        }

        // PUT: api/Cities/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [Authorize(Roles = "RegisteredUser")]
        public async Task<IActionResult> PutCity(int id, City city)
        {
            if (id != city.Id)
            {
                return BadRequest();
            }

            _context.Entry(city).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CityExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Cities
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = "RegisteredUser")]
        public async Task<ActionResult<City>> PostCity(City city)  // TODO:  Change to CityDTO, add saftey checks
        {
          if (_context.Cities == null)
          {
              return Problem("Entity set 'ApplicationDbContext.Cities' is null.");
          }
            _context.Cities.Add(city);
            await _context.SaveChangesAsync();

            return CreatedAtAction("PostCity", new { id = city.Id }, city);
        }

        // DELETE: api/Cities/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> DeleteCity(int id)
        {
            if (_context.Cities == null)
            {
                return NotFound();
            }
            var city = await _context.Cities.FindAsync(id);
            if (city == null)
            {
                return NotFound();
            }

            _context.Cities.Remove(city);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CityExists(int id)
        {
            return (_context.Cities?.Any(e => e.Id == id)).GetValueOrDefault();
        }

        [HttpPost]
        [Route("IsDupeCity")]
        public bool IsDupeCity(City city)  // TODO:  Change to CityDTO...
        {
            // Safety checks
            if ((city.Id < int.MinValue) || (city.Id > int.MaxValue)) return false;
            if ((city.Lat < decimal.MinValue) || (city.Lat > decimal.MaxValue)) return false;
            if ((city.Lon < decimal.MinValue) || (city.Lon > decimal.MaxValue)) return false;
            if ((city.CountryId < int.MinValue) || (city.CountryId > int.MaxValue)) return false;

           return _context.Cities.Any(
                e => e.Name == city.Name
                && e.Lat == city.Lat // TODO:  Fix exception when value is too large (probably best to use validation)
                && e.Lon == city.Lon // TODO:  Fix exception when value is too large
                && e.CountryId == city.CountryId
                && e.Id != city.Id
            );
        }  
    }
}
