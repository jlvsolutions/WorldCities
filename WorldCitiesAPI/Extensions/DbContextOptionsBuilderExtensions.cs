using Microsoft.EntityFrameworkCore;
using Serilog;
using System.Configuration;


namespace WorldCitiesAPI.Extensions;

internal static class DbContextOptionsBuilderExtensions
{
    /// <summary>
    /// Configures the context to use the datastore indicated by the DATASTORE environment variable.
    /// </summary>
    /// <returns>The same DbContextOptionsBuilder, useful for chaining.</returns>
    internal static DbContextOptionsBuilder UseDatastoreFactory(this DbContextOptionsBuilder options, WebApplicationBuilder builder)
    {
        ArgumentNullException.ThrowIfNull(options, nameof(options));
        ArgumentNullException.ThrowIfNull(builder, nameof(builder));

        string? datastore = Environment.GetEnvironmentVariable("DATASTORE") ?? "MSSQL";
        Log.Information("Datastore: {Datastore}", datastore);

        if (datastore.Equals("Postgres"))
        {
            string? connectionString = builder.Configuration.GetConnectionString("PostgresConnection")
                                        ?? Environment.GetEnvironmentVariable("POSTGRES_CONNECTION")
                                        ?? throw new ConfigurationErrorsException("PostgresConnection not found in appsettings or HOST_ENVIRONMENT.");

            options.UseNpgsql(connectionString);
        }
        else
        {
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")
                                 ?? throw new ConfigurationErrorsException("DefaultConnection not found in appsettings."));
        }

        return options;
    }
}
