using FluentValidation;
using HomeBase.Application.DTOs.Lists;

namespace HomeBase.Application.Validators;

public class UpdateListItemRequestValidator : AbstractValidator<UpdateListItemRequest>
{
    public UpdateListItemRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200).When(x => x.Title is not null);
        RuleFor(x => x.Url).MaximumLength(2000).When(x => x.Url is not null);
        RuleFor(x => x.Phone).MaximumLength(30).When(x => x.Phone is not null);
        RuleFor(x => x.Details).MaximumLength(2000).When(x => x.Details is not null);
    }
}
