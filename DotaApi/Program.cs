var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
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
    // OpenDota has a specific endpoint for matchups
    var matchups = await httpClient.GetFromJsonAsync<object>($"https://api.opendota.com/api/heroes/{id}/matchups");
    return Results.Ok(matchups);
});

app.Run();
