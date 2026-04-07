using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HomeBase.Application.DTOs.Auth;
using HomeBase.Application.Services;
using HomeBase.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace HomeBase.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    UserManager<User> userManager,
    SignInManager<User> signInManager,
    IConfiguration configuration,
    CategoryService categoryService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var user = new User { UserName = request.Email, Email = request.Email };
        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
            return BadRequest(new { Errors = result.Errors.Select(e => e.Description) });

        await categoryService.SeedDefaultCategoriesAsync(user.Id);

        var tokens = GenerateTokens(user);
        SetRefreshTokenCookie(tokens.RefreshToken);

        return Ok(new AuthResponse(tokens.AccessToken, tokens.ExpiresAt));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return Unauthorized(new { Error = "Invalid email or password." });

        var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!result.Succeeded)
            return Unauthorized(new { Error = "Invalid email or password." });

        var tokens = GenerateTokens(user);
        SetRefreshTokenCookie(tokens.RefreshToken);

        return Ok(new AuthResponse(tokens.AccessToken, tokens.ExpiresAt));
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized(new { Error = "No refresh token provided." });

        var principal = GetPrincipalFromToken(refreshToken);
        if (principal is null)
            return Unauthorized(new { Error = "Invalid refresh token." });

        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = userId is not null ? await userManager.FindByIdAsync(userId) : null;
        if (user is null)
            return Unauthorized(new { Error = "User not found." });

        var tokens = GenerateTokens(user);
        SetRefreshTokenCookie(tokens.RefreshToken);

        return Ok(new AuthResponse(tokens.AccessToken, tokens.ExpiresAt));
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("refreshToken");
        return Ok(new { Message = "Logged out successfully." });
    }

    private (string AccessToken, string RefreshToken, DateTime ExpiresAt) GenerateTokens(User user)
    {
        var key = configuration["Jwt:Key"] ?? "DevSuperSecretKeyThatIsAtLeast32BytesLong!!";
        var issuer = configuration["Jwt:Issuer"] ?? "HomeBase";
        var audience = configuration["Jwt:Audience"] ?? "HomeBase";

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var accessExpiry = DateTime.UtcNow.AddMinutes(15);
        var accessToken = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: accessExpiry,
            signingCredentials: credentials);

        var refreshExpiry = DateTime.UtcNow.AddDays(7);
        var refreshToken = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: refreshExpiry,
            signingCredentials: credentials);

        var handler = new JwtSecurityTokenHandler();
        return (handler.WriteToken(accessToken), handler.WriteToken(refreshToken), accessExpiry);
    }

    private void SetRefreshTokenCookie(string token)
    {
        Response.Cookies.Append("refreshToken", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7)
        });
    }

    private ClaimsPrincipal? GetPrincipalFromToken(string token)
    {
        var key = configuration["Jwt:Key"] ?? "DevSuperSecretKeyThatIsAtLeast32BytesLong!!";
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            ValidateIssuer = true,
            ValidIssuer = configuration["Jwt:Issuer"] ?? "HomeBase",
            ValidateAudience = true,
            ValidAudience = configuration["Jwt:Audience"] ?? "HomeBase",
            ValidateLifetime = true
        };

        try
        {
            var handler = new JwtSecurityTokenHandler();
            return handler.ValidateToken(token, validationParameters, out _);
        }
        catch
        {
            return null;
        }
    }
}
