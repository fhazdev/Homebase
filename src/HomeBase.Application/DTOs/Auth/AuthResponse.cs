namespace HomeBase.Application.DTOs.Auth;

public record AuthResponse(string AccessToken, DateTime ExpiresAt);
