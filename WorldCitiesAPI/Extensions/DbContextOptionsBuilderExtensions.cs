using Microsoft.EntityFrameworkCore;
using Serilog;
using System.Configuration;


namespace WorldCitiesAPI.Extensions;

internal static class DbContextOptionsBuilderExtensions
{
    /// <summary>
    /// Configures the context to use the datastore indicated by the Datastore appsettings configuration.
    /// </summary>
    /// <returns>The same DbContextOptionsBuilder, useful for chaining.</returns>
    internal static DbContextOptionsBuilder UseDatastoreFactory(this DbContextOptionsBuilder options, WebApplicationBuilder builder)
    {
        ArgumentNullException.ThrowIfNull(options, nameof(options));
        ArgumentNullException.ThrowIfNull(builder, nameof(builder));

        string? datastore = builder.Configuration["Datastore"];
        datastore ??= Environment.GetEnvironmentVariable("DATASTORE") ?? "MSSQL";
        
        Log.Information("Datastore: {Datastore}", datastore);

        if (datastore.Equals("Postgres"))
        {
            // PostgreSQL
            string? connectionString = builder.Configuration.GetConnectionString("PostgresConnection")
                                        ?? Environment.GetEnvironmentVariable("POSTGRES_CONNECTION")
                                        ?? throw new ConfigurationErrorsException("PostgresConnection not found in appsettings or POSTGRES_CONNECTION environment variable.");

            options.UseNpgsql(connectionString);
        }
        else 
        {
            // MSSQL
            options.UseSqlServer(builder.Configuration.GetConnectionString("MSSQLConnection")
                                        ?? Environment.GetEnvironmentVariable("MSSQL_CONNECTION")
                                        ?? throw new ConfigurationErrorsException("MSSQLConnection not found in appsettings or MSSQL_CONNECTION environment variable."));
        }

        return options;
    }
}
