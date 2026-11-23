using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

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
builder.Services.AddMemoryCache(); // 1. Add Caching

// 2. Add Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429; // 429 = Too Many Requests
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 30, // Max 30 requests
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1) // Per 1 minute
            }));
});

var app = builder.Build();

app.UseCors("AllowFrontend");
app.UseRateLimiter(); // Enable Rate Limiter

app.MapGet("/api/test", () => Results.Ok(new { message = "Backend is connected!" }));

// 3. Optimized Heroes Endpoint with DTO and Caching
app.MapGet("/api/heroes", async (HttpClient httpClient, IMemoryCache cache) =>
{
    const string cacheKey = "heroes_data";

    // Check if we have the data in memory first
    if (cache.TryGetValue(cacheKey, out IEnumerable<HeroDto>? cachedHeroes))
    {
        return Results.Ok(cachedHeroes);
    }

    // If not, fetch from OpenDota
    var rawHeroes = await httpClient.GetFromJsonAsync<List<RawHeroStats>>("https://api.opendota.com/api/heroStats");
    
    if (rawHeroes == null) return Results.Problem("Failed to fetch data from OpenDota");

    // Map the huge raw data to our small DTO
    var heroes = rawHeroes.Select(h => new HeroDto
    {
        Id = h.Id,
        LocalizedName = h.LocalizedName,
        PrimaryAttr = h.PrimaryAttr,
        Img = h.Img,
        PubPick = h.PubPick,
        PubWin = h.PubWin,
        ProPick = h.ProPick,
        ProWin = h.ProWin,
        ProBan = h.ProBan,
        // Map the bracket stats needed for the chart
        Bracket1Pick = h.Bracket1Pick, Bracket1Win = h.Bracket1Win,
        Bracket2Pick = h.Bracket2Pick, Bracket2Win = h.Bracket2Win,
        Bracket3Pick = h.Bracket3Pick, Bracket3Win = h.Bracket3Win,
        Bracket4Pick = h.Bracket4Pick, Bracket4Win = h.Bracket4Win,
        Bracket5Pick = h.Bracket5Pick, Bracket5Win = h.Bracket5Win,
        Bracket6Pick = h.Bracket6Pick, Bracket6Win = h.Bracket6Win,
        Bracket7Pick = h.Bracket7Pick, Bracket7Win = h.Bracket7Win
    }).ToList();

    // Save to cache for 1 hour
    cache.Set(cacheKey, heroes, TimeSpan.FromHours(1));

    return Results.Ok(heroes);
});

app.MapGet("/api/heroes/{id}/matchups", async (int id, HttpClient httpClient, IMemoryCache cache) =>
{
    string cacheKey = $"matchups_{id}";

    if (cache.TryGetValue(cacheKey, out object? cachedMatchups))
    {
        return Results.Ok(cachedMatchups);
    }

    var matchups = await httpClient.GetFromJsonAsync<object>($"https://api.opendota.com/api/heroes/{id}/matchups");
    
    // Cache matchups for 1 hour
    cache.Set(cacheKey, matchups, TimeSpan.FromHours(1));

    return Results.Ok(matchups);
});

app.Run();

// --- DTO Definitions ---
// DTO = Data Transfer Object (Only the data the frontend needs)

public class HeroDto
{
    public int Id { get; set; }
    
    [JsonPropertyName("localized_name")]
    public string LocalizedName { get; set; } = string.Empty;
    
    [JsonPropertyName("primary_attr")]
    public string PrimaryAttr { get; set; } = string.Empty;
    
    [JsonPropertyName("img")]
    public string Img { get; set; } = string.Empty;
    
    [JsonPropertyName("pub_pick")]
    public int PubPick { get; set; }
    
    [JsonPropertyName("pub_win")]
    public int PubWin { get; set; }

    [JsonPropertyName("pro_pick")] public int ProPick { get; set; }
    [JsonPropertyName("pro_win")] public int ProWin { get; set; }
    [JsonPropertyName("pro_ban")] public int ProBan { get; set; }

    // Bracket Stats
    [JsonPropertyName("1_pick")] public int Bracket1Pick { get; set; }
    [JsonPropertyName("1_win")] public int Bracket1Win { get; set; }
    [JsonPropertyName("2_pick")] public int Bracket2Pick { get; set; }
    [JsonPropertyName("2_win")] public int Bracket2Win { get; set; }
    [JsonPropertyName("3_pick")] public int Bracket3Pick { get; set; }
    [JsonPropertyName("3_win")] public int Bracket3Win { get; set; }
    [JsonPropertyName("4_pick")] public int Bracket4Pick { get; set; }
    [JsonPropertyName("4_win")] public int Bracket4Win { get; set; }
    [JsonPropertyName("5_pick")] public int Bracket5Pick { get; set; }
    [JsonPropertyName("5_win")] public int Bracket5Win { get; set; }
    [JsonPropertyName("6_pick")] public int Bracket6Pick { get; set; }
    [JsonPropertyName("6_win")] public int Bracket6Win { get; set; }
    [JsonPropertyName("7_pick")] public int Bracket7Pick { get; set; }
    [JsonPropertyName("7_win")] public int Bracket7Win { get; set; }
}

// This class matches the massive JSON from OpenDota
public class RawHeroStats
{
    public int Id { get; set; }
    [JsonPropertyName("localized_name")] public string LocalizedName { get; set; } = string.Empty;
    [JsonPropertyName("primary_attr")] public string PrimaryAttr { get; set; } = string.Empty;
    [JsonPropertyName("img")] public string Img { get; set; } = string.Empty;
    [JsonPropertyName("pub_pick")] public int PubPick { get; set; }
    [JsonPropertyName("pub_win")] public int PubWin { get; set; }
    
    [JsonPropertyName("pro_pick")] public int ProPick { get; set; }
    [JsonPropertyName("pro_win")] public int ProWin { get; set; }
    [JsonPropertyName("pro_ban")] public int ProBan { get; set; }

    [JsonPropertyName("1_pick")] public int Bracket1Pick { get; set; }
    [JsonPropertyName("1_win")] public int Bracket1Win { get; set; }
    [JsonPropertyName("2_pick")] public int Bracket2Pick { get; set; }
    [JsonPropertyName("2_win")] public int Bracket2Win { get; set; }
    [JsonPropertyName("3_pick")] public int Bracket3Pick { get; set; }
    [JsonPropertyName("3_win")] public int Bracket3Win { get; set; }
    [JsonPropertyName("4_pick")] public int Bracket4Pick { get; set; }
    [JsonPropertyName("4_win")] public int Bracket4Win { get; set; }
    [JsonPropertyName("5_pick")] public int Bracket5Pick { get; set; }
    [JsonPropertyName("5_win")] public int Bracket5Win { get; set; }
    [JsonPropertyName("6_pick")] public int Bracket6Pick { get; set; }
    [JsonPropertyName("6_win")] public int Bracket6Win { get; set; }
    [JsonPropertyName("7_pick")] public int Bracket7Pick { get; set; }
    [JsonPropertyName("7_win")] public int Bracket7Win { get; set; }
}