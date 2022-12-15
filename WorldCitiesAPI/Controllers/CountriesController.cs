using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Linq.Dynamic.Core;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorldCitiesAPI.Data;
using Microsoft.AspNetCore.Authorization;
using WorldCitiesAPI.Data.Entities;
using WorldCitiesAPI.Data.Models.Countries;
using WorldCitiesAPI.Data.Models;
using AutoMapper;

namespace WorldCitiesAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CountriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<CountriesController> _logger;

        public CountriesController(ApplicationDbContext context, IMapper mapper, ILogger<CountriesController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/Countries
        [HttpGet]
        public async Task<ActionResult<ApiResult<CountryDTO>>> GetCountries(
            int pageIndex = 0,
            int pageSize = 10,
            string? sortColumn = null,
            string? sortOrder = null,
            string? filterColumn = null,
            string? filterQuery = null)
        {
            _logger.LogInformation(
                "Entering GetCountries. PageIndex: {pageIndex}, FilterQuery: {filterQuery}, FilterColumn: {filterColumn}, SortColumn: {sortColumn}, SortOrder: {sortOrder}",
                pageIndex, filterQuery, filterColumn, sortColumn, sortOrder);
            try
            {
                return await ApiResult<CountryDTO>.CreateAsync(
                        _context.Countries.AsNoTracking()
                        .Select(c => _mapper.Map<CountryDTO>(c)),
                        pageIndex,
                        pageSize,
                        sortColumn,
                        sortOrder,
                        filterColumn,
                        filterQuery);
            }
            catch (NotSupportedException ex)
            {
                _logger.LogError(ex, "GetCountries:  " + ex.Message + ex.StackTrace);
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "GetCities:  " + ex.Message + ex.StackTrace);
                return BadRequest("An invalid operation was attempted.");
            }
            // Middleware to handle other exception types.
        }

        // GET: api/Countries/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CountryDTO>> GetById(int id)
        {
          if (_context.Countries == null)
              return NotFound();
           
            var country = await _context.Countries.FindAsync(id);

            if (country == null)
                return NotFound();
            
            return Ok(_mapper.Map<CountryDTO>(country));
        }

        // PUT: api/Countries/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [Authorize(Roles = "RegisteredUser")]
        public async Task<IActionResult> PutCountry(int id, CountryDTO model)
        {
            if (id != model.Id)
            {
                return BadRequest();
            }
            
            _context.Entry(_mapper.Map<Country>(model)).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CountryExists(id))
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

        // POST: api/Countries
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = "RegisteredUser")]
        public async Task<ActionResult> PostCountry(CountryDTO model)
        {
            Country country = _mapper.Map<Country>(model);
            _context.Countries.Add(country);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = country.Id });
        }

        // DELETE: api/Countries/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Delete(int id)
        {
            Country? country = await _context.Countries.FindAsync(id);
            if (country == null)
            {
                return NotFound();
            }

            _context.Countries.Remove(country);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CountryExists(int id)
        {
            return (_context.Countries?.Any(e => e.Id == id)).GetValueOrDefault();
        }

        [HttpPost]
        [Route("IsDupeField")]
        public bool IsDupeField(int countryId, string fieldName, string fieldValue)
        {
            //switch(fieldName)
            //{
            //    case "name":
            //        return _context.Countries.Any(c => c.Name == fieldValue && c.Id != countryId);
            //    case "iso2":
            //        return _context.Countries.Any(c => c.ISO2 == fieldValue && c.Id != countryId);
            //    case "iso3":
            //        return _context.Countries.Any(c => c.ISO3 == fieldValue && c.Id != countryId);
            //   default:
            //       return false;
            //}

            // Alternative approach... (using System.Linq.Dynamic.Core) Less performant, more DRY (don't repeat yourself).
            return ApiResult<Country>.IsValidProperty(fieldName, true)
                ? _context.Countries.Any(string.Format("{0} == @0 && Id != @1", fieldName), fieldValue, countryId) 
                : false;
        }
    }
}
