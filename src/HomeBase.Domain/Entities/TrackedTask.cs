using HomeBase.Domain.Enums;

namespace HomeBase.Domain.Entities;

public class TrackedTask
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string Icon { get; set; } = "🔧";
    public int? RecurrenceValue { get; set; }
    public RecurrenceUnit? RecurrenceUnit { get; set; }
    public string? Notes { get; set; }
    public DateTime? FirstDueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }

    public required string UserId { get; set; }
    public User? User { get; set; }

    public ICollection<CompletionLog> Completions { get; set; } = [];

    public bool IsRecurring => RecurrenceValue.HasValue && RecurrenceUnit.HasValue;

    public DateTime? NextDueDate
    {
        get
        {
            var lastCompletion = Completions
                .OrderByDescending(c => c.CompletedAt)
                .FirstOrDefault();

            // One-time task: due date is FirstDueDate until completed, then null
            if (!IsRecurring)
                return lastCompletion is null ? FirstDueDate : null;

            if (lastCompletion is null)
                return FirstDueDate;

            return RecurrenceUnit switch
            {
                Enums.RecurrenceUnit.Days => lastCompletion.CompletedAt.AddDays(RecurrenceValue!.Value),
                Enums.RecurrenceUnit.Weeks => lastCompletion.CompletedAt.AddDays(RecurrenceValue!.Value * 7),
                Enums.RecurrenceUnit.Months => lastCompletion.CompletedAt.AddMonths(RecurrenceValue!.Value),
                Enums.RecurrenceUnit.Years => lastCompletion.CompletedAt.AddYears(RecurrenceValue!.Value),
                Enums.RecurrenceUnit.Miles => null, // mileage-based, no calendar due date
                _ => null
            };
        }
    }

    public bool IsOverdue => NextDueDate.HasValue && NextDueDate.Value < DateTime.UtcNow;

    public int? DaysOverdue => IsOverdue
        ? (int)(DateTime.UtcNow - NextDueDate!.Value).TotalDays
        : null;
}
