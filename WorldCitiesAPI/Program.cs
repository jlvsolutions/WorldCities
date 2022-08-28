using Microsoft.EntityFrameworkCore;
using WorldCitiesAPI.Data;
using WorldCitiesAPI.Data.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.MSSqlServer;

var builder = WebApplication.CreateBuilder(args);

// Adds Serilog support
builder.Host.UseSerilog((ctx, lc) => lc
    .ReadFrom.Configuration(ctx.Configuration)
    .WriteTo.MSSqlServer(connectionString: ctx.Configuration.GetConnectionString("DefaultConnection"),
                         restrictedToMinimumLevel: LogEventLevel.Information,
                         sinkOptions: new MSSqlServerSinkOptions
                         {
                             TableName = "LogEvents",
                             AutoCreateSqlTable = true
                         }
                         )
    .WriteTo.Console()
    );

// Add services to the container.

builder.Services.AddControllers(); //;
// This kept here commented out for reference sake.
//    .AddJsonOptions(options =>
//    {
//        options.JsonSerializerOptions.WriteIndented = true;
//        //options.JsonSerializerOptions.PropertyNamingPolicy = null;
//    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add ApplicationDbContext and SQL Server support
builder.Services.AddDbContext<ApplicationDbContext>( options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
        )
);

// Add ASP.NET Core Identity support
builder.Services.AddIdentity<ApplicationUser, IdentityRole>( options =>
{
    // TODO:  Reset these for production...
    options.SignIn.RequireConfirmedAccount = true;
    options.Password.RequireDigit = false;// true;
    options.Password.RequireLowercase = false;// true;
    options.Password.RequireUppercase = false;// true;
    options.Password.RequireNonAlphanumeric = false;// true;
    options.Password.RequiredLength = 2; // 8;
    //options.User.RequireUniqueEmail = false;  // for reference
})
    .AddEntityFrameworkStores<ApplicationDbContext>();

// Add Authentication service & middlewares
builder.Services.AddAuthentication(opt =>
{
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    // this is me trying to get it to work...
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        RequireExpirationTime = true,
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(
                builder.Configuration["JwtSettings:SecurityKey"]))
    };
});

// Add JwtHandler to the services for dependency injection
builder.Services.AddScoped<JwtHandler>();

var app = builder.Build();

// Add HTTP request logging middleware
app.UseSerilogRequestLogging();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication(); // add authentication middleware
app.UseAuthorization();

app.MapControllers();

app.Run();
