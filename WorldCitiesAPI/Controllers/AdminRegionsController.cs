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
using WorldCitiesAPI.Data.Models.AdminRegions;
using WorldCitiesAPI.Data.Models;
using AutoMapper;

namespace WorldCitiesAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminRegionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<AdminRegionsController> _logger;

        public AdminRegionsController(ApplicationDbContext context, IMapper mapper, ILogger<AdminRegionsController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResult<AdminRegionDTO>>> GetAdminRegions(
            int pageIndex = 0,
            int pageSize = 10,
            string? sortColumn = "name",
            string? sortOrder = null,
            string? filterColumn = null,
            string? filterQuery = null)
        {
            _logger.LogInformation(
                "Entering GetAdminRegions. PageIndex: {pageIndex}, FilterQuery: {filterQuery}, FilterColumn: {filterColumn}, SortColumn: {sortColumn}, SortOrder: {sortOrder}",
                pageIndex, filterQuery, filterColumn, sortColumn, sortOrder);
            try
            {
                return await ApiResult<AdminRegionDTO>.CreateAsync(
                        _mapper.ProjectTo<AdminRegionDTO>(_context.AdminRegions.AsNoTracking(), null),
                        pageIndex,
                        pageSize,
                        sortColumn,
                        sortOrder,
                        filterColumn,
                        filterQuery);
            }
            catch (NotSupportedException ex)
            {
                _logger.LogError(ex, "GetAdminRegions:  " + ex.Message + ex.StackTrace);
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "GetAdminRegions:  " + ex.Message + ex.StackTrace);
                return BadRequest("An invalid operation was attempted.");
            }
            // Middleware to handle other exception types.
        }

        [HttpGet("Country/{id}")]
        public async Task<ActionResult<ApiResult<AdminRegionDTO>>> GetByCountry(
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
                return await ApiResult<AdminRegionDTO>.CreateAsync(
                        _mapper.ProjectTo<AdminRegionDTO>(_context.AdminRegions.AsNoTracking()
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

        [HttpGet("{id}")]
        public ActionResult<AdminRegionDTO> GetAdminRegion(int id)
        {
            _logger.LogDebug("Entering GetAdminRegion. Id: {id}", id);
            var adminRegion = _context.AdminRegions.Include(ar => ar.Country)
                                                   .Include(ar => ar.Cities)
                                                   .SingleOrDefault(ar => ar.Id == id);

            if (adminRegion == null)
                return NotFound();

            return Ok(_mapper.Map<AdminRegionDTO>(adminRegion));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "RegisteredUser")]
        public async Task<IActionResult> PutAdminRegion(int id, Country country) // TODO: Change to CountryDTO...
        {
            if (id != country.Id)
            {
                return BadRequest();
            }

            _context.Entry(country).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AdminRegionExists(id))
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

        [HttpPost]
        [Authorize(Roles = "RegisteredUser")]
        public async Task<ActionResult> PostCountry(AdminRegionDTO model)
        {
            AdminRegion ar = _mapper.Map<AdminRegion>(model);
            _context.AdminRegions.Add(ar);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAdminRegion), new { id = ar.Id });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Delete(int id)
        {
            AdminRegion? adminRegion = await _context.AdminRegions.FindAsync(id);
            if (adminRegion == null)
            {
                return NotFound();
            }

            _context.AdminRegions.Remove(adminRegion);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AdminRegionExists(int id)
        {
            return (_context.AdminRegions?.Any(e => e.Id == id)).GetValueOrDefault();
        }

        [HttpPost]
        [Route("IsDupeAdminRegion")]
        public bool IsDupAdminRegion(AdminRegionDTO model)
        {
            // Safety checks
            if ((model.Id < int.MinValue) || (model.Id > int.MaxValue)) return false;
            if ((model.CountryId < int.MinValue) || (model.CountryId > int.MaxValue)) return false;

            return _context.AdminRegions.Any(
                 e => e.Name == model.Name
                 && e.Code == model.Code
                 && e.CountryId == model.CountryId
                 && e.Id != model.Id
             );
        }

    }
}
