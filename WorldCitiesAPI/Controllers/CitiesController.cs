using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorldCitiesAPI.Data;
using Microsoft.AspNetCore.Authorization;
using WorldCitiesAPI.Data.Entities;
using WorldCitiesAPI.Data.Models.Cities;
using WorldCitiesAPI.Data.Models;
using AutoMapper;

namespace WorldCitiesAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CitiesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<CitiesController> _logger;

    public CitiesController(ApplicationDbContext context, IMapper mapper, ILogger<CitiesController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResult<CityDTO>>> GetCities(
        int pageIndex = 0,
        int pageSize = 10,
        string? sortColumn = "name",
        string? sortOrder = null,
        string? filterColumn = null,
        string? filterQuery = null)
    {
        _logger.LogInformation(
            "Entering GetCities. PageIndex: {pageIndex}, FilterQuery: {filterQuery}, FilterColumn: {filterColumn}, SortColumn: {sortColumn}, SortOrder: {sortOrder}",
            pageIndex, filterQuery, filterColumn, sortColumn, sortOrder);

        try
        {
            return await ApiResult<CityDTO>.CreateAsync(
                        _mapper.ProjectTo<CityDTO>(_context.Cities.AsNoTracking(), null),
                        pageIndex,
                        pageSize,
                        sortColumn,
                        sortOrder,
                        filterColumn,
                        filterQuery);
        }
        catch (NotSupportedException ex)
        {
            _logger.LogError(ex, "GetCities:  " + ex.Message + ex.StackTrace);
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "GetCities:  " + ex.Message + ex.StackTrace);
            return BadRequest("An invalid operation was attempted.");
        }
        // Middleware to handle other exception types.
    }

    [HttpGet("AdminRegion/{id}")]
    public async Task<ActionResult<ApiResult<CityDTO>>> GetByAdminRegion(
        int id,
        int pageIndex = 0,
        int pageSize = 10,
        string? sortColumn = "name", // Guarantees an 'order by' clause
        string? sortOrder = null,
        string? filterColumn = null,
        string? filterQuery = null)
    {
        _logger.LogInformation(
            "Entering GetByAdminRegion. AdminRegionId: {id}, PageIndex: {pageIndex}, FilterQuery: {filterQuery}, FilterColumn: {filterColumn}, SortColumn: {sortColumn}, SortOrder: {sortOrder}",
            id, pageIndex, filterQuery, filterColumn, sortColumn, sortOrder);

        try
        {
            return await ApiResult<CityDTO>.CreateAsync(
                        _mapper.ProjectTo<CityDTO>(_context.Cities.AsNoTracking()
                        .Where(c => c.AdminRegionId == id), null),
                        pageIndex,
                        pageSize,
                        sortColumn,
                        sortOrder,
                        filterColumn,
                        filterQuery,
                        _context.AdminRegions.Find(id)?.Name);
        }
        catch (NotSupportedException ex)
        {
            _logger.LogError(ex, "GetByAdminRegion:  " + ex.Message + ex.StackTrace);
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "GetByAdminRegion:  " + ex.Message + ex.StackTrace);
            return BadRequest("An invalid operation was attempted.");
        }
        // Middleware to handle other exception types.
    }

    [HttpGet("Country/{id}")]
    public async Task<ActionResult<ApiResult<CityDTO>>> GetByCountry(
        int id,
        int pageIndex = 0,
        int pageSize = 10,
        string? sortColumn = "name",
        string? sortOrder = null,
        string? filterColumn = null,
        string? filterQuery = null)
    {
        _logger.LogInformation(
            "Entering GetByCountry. CountryId: {id}, PageIndex: {pageIndex}, FilterQuery: {filterQuery}, FilterColumn: {filterColumn}, SortColumn: {sortColumn}, SortOrder: {sortOrder}",
            id, pageIndex, filterQuery, filterColumn, sortColumn, sortOrder);

        try
        {
            return await ApiResult<CityDTO>.CreateAsync(
                        _mapper.ProjectTo<CityDTO>(_context.Cities.AsNoTracking()
                        .Where(c => c.CountryId == id), null),
                        pageIndex,
                        pageSize,
                        sortColumn,
                        sortOrder,
                        filterColumn,
                        filterQuery,
                        _context.Countries.Find(id)?.Name);
        }
        catch (NotSupportedException ex)
        {
            _logger.LogError(ex, "GetByCountry:  " + ex.Message + ex.StackTrace);
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "GetByCountry:  " + ex.Message + ex.StackTrace);
            return BadRequest("An invalid operation was attempted.");
        }
        // Middleware to handle other exception types.
    }

    // GET: api/Cities/5
    [HttpGet("{id}")]
    public ActionResult<CityDTO> GetCity(int id)
    {
        _logger.LogDebug("Entering GetCity. Id: {id}", id);
        var city = _context.Cities.Where(c => c.Id == id)
                                  .Include(c => c.AdminRegion)
                                  .Include(c => c.Country)
                                  .FirstOrDefault();  
        
        if (city == null)
            return NotFound();

        return(_mapper.Map<CityDTO>(city));
    }

    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{id}")]
    [Authorize(Roles = "RegisteredUser")]
    public async Task<IActionResult> PutCity(int id, CityDTO model)
    {
        if (id != model.Id)
        {
            return BadRequest();
        }

        _context.Entry(_mapper.Map<City>(model)).State = EntityState.Modified;

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
    public async Task<ActionResult> PostCity(CityDTO model)
    {
        City city = _mapper.Map<City>(model);
        _context.Cities.Add(city);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCity), new { id = city.Id });
    }

    // DELETE: api/Cities/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> Delete(int id)
    {
        City? city = await _context.Cities.FindAsync(id);
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
    public bool IsDupeCity(CityDTO city)
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
