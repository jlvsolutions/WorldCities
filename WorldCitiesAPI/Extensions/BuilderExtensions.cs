using Serilog;

namespace WorldCitiesAPI.Extensions;

internal static class BuilderExtensions
{
    /// <summary>
    /// Creates and configures a Serilog logger for this application based on
    /// environment and configuration settings.
    /// </summary>
    /// <param name="builder">The Builder for this WebApplication.</param>
    internal static WebApplicationBuilder? ConfigureLogging(this WebApplicationBuilder? builder)
    {
        ArgumentNullException.ThrowIfNull(builder, nameof(builder));

        string? hostEnvironment = Environment.GetEnvironmentVariable("HOST_ENVIRONMENT");

        builder.Logging.ClearProviders();

        Log.Logger = new LoggerConfiguration()
            .ReadFrom.Configuration(builder.Configuration)
            .WriteToAwsCloudWatch(builder, hostEnvironment)
            .WriteToMSSqlServer(builder, hostEnvironment)
            .CreateLogger();

        builder.Services.AddSerilog();

        return builder;
    }
}
