using FluentValidation;
using HomeBase.Application.DTOs.Categories;

namespace HomeBase.Application.Validators;

public class CreateCategoryRequestValidator : AbstractValidator<CreateCategoryRequest>
{
    public CreateCategoryRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Icon).MaximumLength(10).When(x => x.Icon is not null);
    }
}
