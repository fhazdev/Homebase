using System.Net;
using System.Net.Http.Json;
using HomeBase.Application.DTOs.Auth;

namespace HomeBase.Api.Tests.Controllers;

public class AuthControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AuthControllerTests(CustomWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task Register_ValidRequest_ReturnsOkWithToken()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register",
            new RegisterRequest("newuser@example.com", "SecurePass123!"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(auth);
        Assert.False(string.IsNullOrEmpty(auth.AccessToken));
    }

    [Fact]
    public async Task Register_DuplicateEmail_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();
        var email = $"dup-{Guid.NewGuid()}@example.com";

        await client.PostAsJsonAsync("/api/auth/register",
            new RegisterRequest(email, "SecurePass123!"));

        var response = await client.PostAsJsonAsync("/api/auth/register",
            new RegisterRequest(email, "SecurePass123!"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_WeakPassword_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register",
            new RegisterRequest("weak@example.com", "short"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOkWithToken()
    {
        var client = _factory.CreateClient();
        var email = $"login-{Guid.NewGuid()}@example.com";
        var password = "SecurePass123!";

        await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, password));

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest(email, password));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(auth);
        Assert.False(string.IsNullOrEmpty(auth.AccessToken));
    }

    [Fact]
    public async Task Login_WrongPassword_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        var email = $"wrongpw-{Guid.NewGuid()}@example.com";

        await client.PostAsJsonAsync("/api/auth/register",
            new RegisterRequest(email, "SecurePass123!"));

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest(email, "WrongPassword1!"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_NonexistentUser_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("nobody@example.com", "SomePass123!"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Logout_ReturnsOk()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsync("/api/auth/logout", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
