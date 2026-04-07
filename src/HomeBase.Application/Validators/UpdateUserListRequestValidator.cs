using FluentValidation;
using HomeBase.Application.DTOs.Lists;

namespace HomeBase.Application.Validators;

public class UpdateUserListRequestValidator : AbstractValidator<UpdateUserListRequest>
{
    public UpdateUserListRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100).When(x => x.Name is not null);
        RuleFor(x => x.Icon).MaximumLength(10).When(x => x.Icon is not null);
    }
}
