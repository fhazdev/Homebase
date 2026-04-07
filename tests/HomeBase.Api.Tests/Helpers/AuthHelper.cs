using System.Net.Http.Json;
using HomeBase.Application.DTOs.Auth;

namespace HomeBase.Api.Tests.Helpers;

public static class AuthHelper
{
    public static async Task<string> RegisterAndGetTokenAsync(
        HttpClient client,
        string email = "test@example.com",
        string password = "TestPassword1!!")
    {
        var response = await client.PostAsJsonAsync("/api/auth/register",
            new RegisterRequest(email, password));
        response.EnsureSuccessStatusCode();

        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        return auth!.AccessToken;
    }

    public static void SetToken(HttpClient client, string token)
    {
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    }

    public static async Task<HttpClient> CreateAuthenticatedClientAsync(
        CustomWebApplicationFactory factory,
        string email = "test@example.com")
    {
        var client = factory.CreateClient();
        var token = await RegisterAndGetTokenAsync(client, email);
        SetToken(client, token);
        return client;
    }
}
