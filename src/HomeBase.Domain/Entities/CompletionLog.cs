namespace HomeBase.Domain.Entities;

public class CompletionLog
{
    public Guid Id { get; set; }
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
    public string? PhotoUrl { get; set; }

    public Guid TaskId { get; set; }
    public TrackedTask? Task { get; set; }
}
