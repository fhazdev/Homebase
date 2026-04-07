using FluentValidation;
using HomeBase.Application.DTOs.Lists;

namespace HomeBase.Application.Validators;

public class CreateUserListRequestValidator : AbstractValidator<CreateUserListRequest>
{
    public CreateUserListRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Icon).MaximumLength(10).When(x => x.Icon is not null);
    }
}
