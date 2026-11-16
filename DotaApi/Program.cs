var builder = WebApplication.CreateBuilder(args);

// Read the allowed origin from environment variables (fallback to localhost for development)
var allowedOrigin = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173";

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(allowedOrigin)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddHttpClient();

var app = builder.Build();

app.UseCors("AllowFrontend");

app.MapGet("/api/test", () => Results.Ok(new { message = "Backend is connected!" }));

app.MapGet("/api/heroes", async (HttpClient httpClient) =>
{
    var heroes = await httpClient.GetFromJsonAsync<object>("https://api.opendota.com/api/heroStats");
    return Results.Ok(heroes);
});

app.MapGet("/api/heroes/{id}/matchups", async (int id, HttpClient httpClient) =>
{
    var matchups = await httpClient.GetFromJsonAsync<object>($"https://api.opendota.com/api/heroes/{id}/matchups");
    return Results.Ok(matchups);
});

app.Run();
