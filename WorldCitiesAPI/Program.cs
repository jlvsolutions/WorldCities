using Microsoft.EntityFrameworkCore;
using WorldCitiesAPI.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Microsoft.AspNetCore.Cors;
using WorldCitiesAPI.Data.GraphQL;
using WorldCitiesAPI.Services;
using WorldCitiesAPI.Data.Entities;
using WorldCitiesAPI.Helpers;
using WorldCitiesAPI.Extensions;
using System.Configuration;
using System.Globalization;
using OfficeOpenXml;


WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
builder.ConfigureLogging();

string envAppName = builder.Environment.ApplicationName;
string envName = builder.Environment.EnvironmentName;

try
{
    Log.Information("{EnvAppName}: Starting in {EnvName} environment...", envAppName, envName);

    // Since version EPPlus version 5, this is required:
    ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

    // Add services to the container.
    builder.Services.AddAutoMapper(typeof(Program));
    builder.Services.AddControllers();

    // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    builder.Services.AddCors(options =>
        options.AddPolicy(name: "AngularPolicy",
            cfg =>
            {
                cfg.AllowAnyHeader();
                cfg.AllowAnyMethod();
                cfg.WithOrigins(builder.Configuration["AllowedCORS"]
                                ?? throw new ConfigurationErrorsException("AllowedCORS not found in appsettings."));
            }));

    // Add ApplicationDbContext
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseDatastoreFactory(builder)
        );

    // Add ASP.NET Core Identity support
    builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        // TODO:  Reset these for production...
        //options.Stores.
        options.SignIn.RequireConfirmedAccount = true;
        options.Password.RequireDigit = false;// true;
        options.Password.RequireLowercase = false;// true;
        options.Password.RequireUppercase = false;// true;
        options.Password.RequireNonAlphanumeric = false;// true;
        options.Password.RequiredLength = 2; // 8;
        options.User.RequireUniqueEmail = true;
    })
        .AddEntityFrameworkStores<ApplicationDbContext>();

    // Add Authentication service & middlewares
    builder.Services.AddAuthentication(opt =>
    {
        opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
        .AddJwtBearer(options =>
    {
        options.SaveToken = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            RequireExpirationTime = true,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            // JwtSettings are kept in Secrets Manager
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"]
                            ?? throw new ConfigurationErrorsException("JwtSettings:Issuer not found in appsettings."),
            ValidAudience = builder.Configuration["JwtSettings:Audience"]
                            ?? throw new ConfigurationErrorsException("JwtSettings:Audience not found in appsettings."),
            IssuerSigningKey = new SymmetricSecurityKey(
                                    System.Text.Encoding.UTF8.GetBytes(
                                        builder.Configuration["JwtSettings:SecurityKey"]
                                        ?? throw new ConfigurationErrorsException("JwtSettings:SecurityKey not found in appsettings")))
        };
    });

    // Configure dependency injection for application services.
    builder.Services.AddScoped<JwtHandler>();
    builder.Services.AddScoped<IUserService, UserService>();

    // Add GraphQL services.
    //builder.Services.AddGraphQLServer()
    //    .AddAuthorization()
    //    .AddQueryType<Query>()
    //    .AddMutationType<Mutation>()
    //    .AddFiltering()
    //    .AddSorting();

    var app = builder.Build();

    // Add Serilog HTTP request logging middleware
    app.UseSerilogRequestLogging();
    //app.UseSerilogRequestLogging(options =>
    //    options.EnrichDiagnosticContext = RequestEnricher.LogAdditionalInfo);

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }
    else
    {
        app.UseExceptionHandler("/Error");
        app.MapGet("/Error", () => Results.Problem());
        app.UseHsts();
    }

    app.UseHttpsRedirection();

    // Invoke the UseForwardedHeaders middleware and configure it 
    // to forward the X-Forwarded-For and X-Forwarded-Proto headers.
    // NOTE: This must be put BEFORE calling UseAuthentication 
    // and other authentication scheme middlewares.
    /*app.UseForwardedHeaders(new ForwardedHeadersOptions
    {
        ForwardedHeaders = ForwardedHeaders.XForwardedFor
        | ForwardedHeaders.XForwardedProto
    });
    */

    // Important  to place this BEFORE middlewares that handle various endpoints.
    // so that our CORS plicy will be applied to all of them.
    app.UseCors("AngularPolicy");

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    // Add GraphQL middleware.
    // app.MapGraphQL("/api/graphql");

    app.MapMethods("/api/heartbeat", ["HEAD"], () => Results.Ok());

    app.Logger.LogInformation("Starting the API.");
    app.Run();

}
catch (Exception ex)
{
    Log.Fatal(ex, "{EnvAppName}: Application terminated unexpectedly.", envAppName);
}
finally
{
    Log.CloseAndFlush();
}
