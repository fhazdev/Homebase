using FluentValidation;
using HomeBase.Application.DTOs.Tasks;

namespace HomeBase.Application.Validators;

public class UpdateTaskRequestValidator : AbstractValidator<UpdateTaskRequest>
{
    public UpdateTaskRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200).When(x => x.Name is not null);
        RuleFor(x => x.RecurrenceValue).GreaterThan(0).When(x => x.RecurrenceValue.HasValue);
        RuleFor(x => x.RecurrenceUnit).IsInEnum().When(x => x.RecurrenceUnit.HasValue);
        RuleFor(x => x.CategoryId).NotEmpty().When(x => x.CategoryId.HasValue);
        RuleFor(x => x.Icon).MaximumLength(10).When(x => x.Icon is not null);
        RuleFor(x => x.Notes).MaximumLength(2000).When(x => x.Notes is not null);

        // When converting to one-time, require a due date
        RuleFor(x => x.FirstDueDate).NotNull()
            .When(x => x.IsRecurring.HasValue && !x.IsRecurring.Value)
            .WithMessage("FirstDueDate is required when converting to a one-time task.");
    }
}
