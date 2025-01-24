using Amazon.CloudWatchLogs;
using Amazon.Runtime;
using Serilog.Formatting;
using Serilog;
using Serilog.Sinks.AwsCloudWatch;
using System.Configuration;

namespace WorldCitiesAPI.Extensions;

internal static class LoggerConfigurationExtensions
{
    /// <summary>
    /// Adds a Serilog sink for writing to AWS CloudWatch when LogToCloudWatch is set to True in appsettings.
    /// Credentials are derived from eith the AWSCredentials settings in User Secrets Manager, or, from EC2 instance permissions
    /// based on the HOST_ENVIRONMENT environment variable set to AWS_EC2.
    /// </summary>
    /// <param name="loggerConfiguration">The <see cref="LoggerConfiguration"/> to configure.</param>
    /// <param name="builder">The <see cref="WebApplicationBuilder"/> being used to build the application.</param>
    /// <param name="hostEnvironment">The value, if any, of the HOST_ENVIRONMENT environment variable.  Used to describe the hosting
    /// environment such as Local on development machine, AWS_EC2 when depoloyed to an AWS EC2 instance.</param>
    /// <returns>The same LoggerConfiguration, useful for chaining.</returns>
    internal static LoggerConfiguration WriteToAwsCloudWatch(this LoggerConfiguration loggerConfiguration, WebApplicationBuilder builder, string? hostEnvironment)
    {
        ArgumentNullException.ThrowIfNull(builder, nameof(loggerConfiguration));

        if (builder.Configuration["LogToCloudWatch"]?.ToUpper().Equals("TRUE") ?? false)
        {
            string envAppName = builder.Environment.ApplicationName;
            string envName = builder.Environment.EnvironmentName;
            string machineName = Environment.MachineName;
            string? cloudWatchAccessKey = builder.Configuration["AWSCredentials:DevelopmentCloudWatchAccessKey"];
            string? cloudWatchSecretKey = builder.Configuration["AWSCredentials:DevelopmentCloudWatchSecretKey"];
            string cloudWatchGroupName = $"{machineName}/{envAppName}/{envName}";
            string cloudWatchLogStreamPrefix = $"{envAppName} - {DateTime.Now:yyyy-MM-dd HH-mm-ss} - "; // Must not contain colons.
            ITextFormatter cloudWatchTextFormatter = new Serilog.Formatting.Json.JsonFormatter();

            // Set up AWS CloudWatch client credentials
            var cloudWatchClient = hostEnvironment?.Equals("AWS_EC2") ?? false
                ? new AmazonCloudWatchLogsClient(Amazon.RegionEndpoint.USEast2)
                : new AmazonCloudWatchLogsClient(
                            new BasicAWSCredentials(cloudWatchAccessKey, cloudWatchSecretKey),
                            Amazon.RegionEndpoint.USEast2);

            // Add AWS CloudWatch to logger configuration
            loggerConfiguration.WriteTo.AmazonCloudWatch(
                        logGroup: cloudWatchGroupName,
                        createLogGroup: true,
                        logStreamPrefix: cloudWatchLogStreamPrefix,
                        // textFormatter: cloudWatchTextFormatter,
                        batchSizeLimit: 100,
                        queueSizeLimit: 10_000,
                        batchUploadPeriodInSeconds: 15,
                        maxRetryAttempts: 3,
                        cloudWatchClient: cloudWatchClient);
        }

        return loggerConfiguration;
    }
    /// <summary>
    /// Adds a Serilog sink for writing to a MSSQL server instance when LogToMSSqlServer is set to True in appsettings.
    /// Connection string comes from ConnectionStrings:DefaultConnection in appsettings.
    /// </summary>
    /// <param name="loggerConfiguration">The <see cref="LoggerConfiguration"/> to configure.</param>
    /// <param name="builder">The <see cref="WebApplicationBuilder"/> being used to build the application.</param>
    /// <param name="hostEnvironment">The value, if any, of the HOST_ENVIRONMENT environment variable.  Used to describe the hosting
    /// environment such as Local on development machine, AWS_EC2 when depoloyed t internal static LoggerConfiguration WriteToMSSqlServer(this LoggerConfiguration loggerConfiguration, WebApplicationBuilder builder, string? hostEnvironment)

    internal static LoggerConfiguration WriteToMSSqlServer(this LoggerConfiguration loggerConfiguration, WebApplicationBuilder builder, string? hostEnvironment)
    {
        ArgumentNullException.ThrowIfNull(builder, nameof(loggerConfiguration));
      
        if (builder.Configuration["LogToMSSqlServer"]?.ToUpper().Equals("TRUE") ?? false)
        {
            loggerConfiguration.WriteTo.MSSqlServer(
                connectionString: builder.Configuration.GetConnectionString("DefaultConnection")
                                  ?? throw new ConfigurationErrorsException("Configuration error.  Did not find DefaultConnection in appsettings."),
                sinkOptions: new Serilog.Sinks.MSSqlServer.MSSqlServerSinkOptions
                {
                    TableName = "LogEvents",
                    AutoCreateSqlTable = true
                });
        }

        return loggerConfiguration;
    }
}
