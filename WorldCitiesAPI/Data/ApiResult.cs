﻿using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;
using System.Reflection;
using EFCore.BulkExtensions;

namespace WorldCitiesAPI.Data
{
    public class ApiResult<T>
    {
        /// <summary>
        /// Private constructor called by the Create method.
        /// </summary>
        private ApiResult(
            List<T> data, 
            int count, 
            int pageIndex, 
            int pageSize,
            string? sortColumn,
            string? sortOrder,
            string? filterColumn,
            string? filterQuery)
        {
            Data = data;
            TotalCount = count;
            PageIndex = pageIndex;
            PageSize = pageSize;
            TotalPages = (int)Math.Ceiling(count / (double)pageSize);
            SortColumn = sortColumn;
            SortOrder = sortOrder;
            FilterColumn = filterColumn;
            FilterQuery = filterQuery;
        }

        #region Methods
        /// <summary>
        /// Pages and/or IQueryable source.
        /// </summary>
        /// <param name="source">An IQueryable source of generic type</param>
        /// <param name="pageIndex">Zero-based current page index (0 = first page)</param>
        /// <param name="pageSize">The actual size of each page</param>
        /// <param name="SortColumn">The sorting column name</param>
        /// <param name="SortOrder">The sorting order ("ASC" or "DESC")</param>
        /// <param name="filterColumn">The filtering column name</param>
        /// <param name="fileterQuery">The filtering query (value to lookup)</param>
        /// <returns>An object containing the IQueryable paged/sorted result
        /// and all the relevant paging/sorting navigation info.</returns>
        public static async Task<ApiResult<T>> CreateAsync(
            IQueryable<T> source,
            int pageIndex,
            int pageSize,
            string? sortColumn = null,
            string? sortOrder = null,
            string? filterColumn = null,
            string? filterQuery = null)
        {
            if (!string.IsNullOrEmpty(filterColumn) && !string.IsNullOrEmpty(filterQuery) && IsValidProperty(filterColumn))
            {
                // Perform filtering...
                source = source.Where(
                    string.Format("{0}.StartsWith(@0)", filterColumn),
                    filterQuery);
            }

            // Get the Count...
            var count = await source.CountAsync();

            if (!string.IsNullOrEmpty(sortColumn) && IsValidProperty(sortColumn))
            {
                // Perform ordering...
                if (string.IsNullOrEmpty(sortOrder))
                    sortOrder = "ASC";

                sortOrder = sortOrder.ToUpper() == "DESC" ? "DESC" : "ASC";

                source = source.OrderBy( string.Format("{0} {1}", sortColumn, sortOrder) );
            }

            source = source
                .Skip(pageIndex * pageSize)
                .Take(pageSize);
#if DEBUG
            // retrieve the SQL query (for debug purposes)
            var sql = source.ToParametrizedSql();
#endif
            var data = await source.ToListAsync(); // Note: this executes the SQL query

            return new ApiResult<T>(data, count, pageIndex, pageSize, sortColumn, sortOrder, filterColumn, filterQuery);
        }

        /// <summary>
        /// Checks if the given property name exists
        /// to protect against SQL injection attacks.
        /// </summary>
        public static bool IsValidProperty(
            string propertyName,
            bool throwExceptionIfNotFound = true)
        {
            var prop = typeof(T).GetProperty(
                propertyName,
                BindingFlags.IgnoreCase |
                BindingFlags.Public |
                BindingFlags.Instance);
            
            if (prop == null && throwExceptionIfNotFound)
                throw new NotSupportedException($"ERROR: Property '{propertyName}' does not exist.");

            return prop != null;
        }
        #endregion

        #region Properties
        /// <summary>
        /// The data result.
        /// </summary>
        public List<T> Data { get; private set; }

        /// <summary>
        /// Zero-based index of current page.
        /// </summary>
        public int PageIndex { get; private set; }

        /// <summary>
        /// Number of items contained in each page.
        /// </summary>
        public int PageSize { get; private set; }

        /// <summary>
        /// Total items count
        /// </summary>
        public int TotalCount { get; private set; }

        /// <summary>
        /// Total pages count
        /// </summary>
        public int TotalPages { get; private set; }

        /// <summary>
        /// TRUE if the current page has a previous page, FALSE otherwise.
        /// </summary>
        public bool HasPreviousPage 
        {  
            get { return (PageIndex > 0); }
        }

        /// <summary>
        /// TRUE if the current page has a next page, FALSE otherwise.
        /// </summary>
        public bool HasNextPage
        {
            get { return ((PageIndex + 1) < TotalPages); }
        }

        /// <summary>
        /// Sorting Column name (or null if none set)
        /// </summary>
        public string? SortColumn { get; private set; }

        /// <summary>
        /// Sorting Order ("ASC", "DESC", or null if none set)
        /// </summary>
        public string? SortOrder { get; private set; }

        /// <summary>
        /// Filter Column name (or null if none set)
        /// </summary>
        public string? FilterColumn { get; private set; }

        /// <summary>
        /// Filter Query string
        /// (to b e used within the given FilterColumn)
        /// </summary>
        public string? FilterQuery { get; private set; }
        #endregion
    }
}
