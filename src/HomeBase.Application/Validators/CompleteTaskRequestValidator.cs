using FluentValidation;
using HomeBase.Application.DTOs.Tasks;

namespace HomeBase.Application.Validators;

public class CompleteTaskRequestValidator : AbstractValidator<CompleteTaskRequest>
{
    public CompleteTaskRequestValidator()
    {
        RuleFor(x => x.CompletedAt)
            .LessThanOrEqualTo(DateTime.UtcNow.AddMinutes(5))
            .WithMessage("Completion date cannot be in the future.")
            .When(x => x.CompletedAt.HasValue);

        RuleFor(x => x.Notes).MaximumLength(2000).When(x => x.Notes is not null);
        RuleFor(x => x.PhotoUrl).MaximumLength(2048).When(x => x.PhotoUrl is not null);
    }
}
