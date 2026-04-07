using FluentValidation;
using HomeBase.Application.DTOs.Tasks;

namespace HomeBase.Application.Validators;

public class CreateTaskRequestValidator : AbstractValidator<CreateTaskRequest>
{
    public CreateTaskRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.Icon).MaximumLength(10).When(x => x.Icon is not null);
        RuleFor(x => x.Notes).MaximumLength(2000).When(x => x.Notes is not null);

        // Recurring task: validate recurrence fields when provided
        RuleFor(x => x.RecurrenceValue).GreaterThan(0)
            .When(x => x.RecurrenceValue.HasValue);
        RuleFor(x => x.RecurrenceUnit).IsInEnum()
            .When(x => x.RecurrenceUnit.HasValue);

        // If one recurrence field is set, both must be set
        RuleFor(x => x.RecurrenceUnit).NotNull()
            .When(x => x.RecurrenceValue.HasValue)
            .WithMessage("RecurrenceUnit is required when RecurrenceValue is provided.");
        RuleFor(x => x.RecurrenceValue).NotNull()
            .When(x => x.RecurrenceUnit.HasValue)
            .WithMessage("RecurrenceValue is required when RecurrenceUnit is provided.");

        // One-time tasks must have a due date
        RuleFor(x => x.FirstDueDate).NotNull()
            .When(x => !x.RecurrenceValue.HasValue && !x.RecurrenceUnit.HasValue)
            .WithMessage("FirstDueDate is required for one-time tasks.");
    }
}
