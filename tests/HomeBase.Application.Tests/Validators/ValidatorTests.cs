using FluentValidation.TestHelper;
using HomeBase.Application.DTOs.Auth;
using HomeBase.Application.DTOs.Categories;
using HomeBase.Application.DTOs.Tasks;
using HomeBase.Application.Validators;
using HomeBase.Domain.Enums;

namespace HomeBase.Application.Tests.Validators;

public class CreateTaskRequestValidatorTests
{
    private readonly CreateTaskRequestValidator _validator = new();

    [Fact]
    public void Valid_Request_Passes()
    {
        var request = new CreateTaskRequest("Oil Change", "🔧", 3, RecurrenceUnit.Months, null, null, Guid.NewGuid());
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Empty_Name_Fails()
    {
        var request = new CreateTaskRequest("", null, 1, RecurrenceUnit.Days, null, null, Guid.NewGuid());
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Name_TooLong_Fails()
    {
        var request = new CreateTaskRequest(new string('x', 201), null, 1, RecurrenceUnit.Days, null, null, Guid.NewGuid());
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void RecurrenceValue_Zero_Fails()
    {
        var request = new CreateTaskRequest("Task", null, 0, RecurrenceUnit.Days, null, null, Guid.NewGuid());
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.RecurrenceValue);
    }

    [Fact]
    public void RecurrenceValue_Negative_Fails()
    {
        var request = new CreateTaskRequest("Task", null, -1, RecurrenceUnit.Days, null, null, Guid.NewGuid());
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.RecurrenceValue);
    }

    [Fact]
    public void Invalid_RecurrenceUnit_Fails()
    {
        var request = new CreateTaskRequest("Task", null, 1, (RecurrenceUnit)99, null, null, Guid.NewGuid());
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.RecurrenceUnit);
    }

    [Fact]
    public void Empty_CategoryId_Fails()
    {
        var request = new CreateTaskRequest("Task", null, 1, RecurrenceUnit.Days, null, null, Guid.Empty);
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.CategoryId);
    }
}

public class UpdateTaskRequestValidatorTests
{
    private readonly UpdateTaskRequestValidator _validator = new();

    [Fact]
    public void AllNulls_Passes()
    {
        var request = new UpdateTaskRequest(null, null, null, null, null, null, null, null);
        _validator.TestValidate(request).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Empty_Name_Fails()
    {
        var request = new UpdateTaskRequest("", null, null, null, null, null, null, null);
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void RecurrenceValue_Zero_Fails()
    {
        var request = new UpdateTaskRequest(null, null, 0, null, null, null, null, null);
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.RecurrenceValue);
    }

    [Fact]
    public void Valid_Partial_Update_Passes()
    {
        var request = new UpdateTaskRequest("New Name", null, 5, RecurrenceUnit.Months, null, null, null, null);
        _validator.TestValidate(request).ShouldNotHaveAnyValidationErrors();
    }
}

public class CompleteTaskRequestValidatorTests
{
    private readonly CompleteTaskRequestValidator _validator = new();

    [Fact]
    public void AllNulls_Passes()
    {
        var request = new CompleteTaskRequest(null, null, null);
        _validator.TestValidate(request).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void PastDate_Passes()
    {
        var request = new CompleteTaskRequest(DateTime.UtcNow.AddHours(-1), null, null);
        _validator.TestValidate(request).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void FutureDate_Fails()
    {
        var request = new CompleteTaskRequest(DateTime.UtcNow.AddDays(1), null, null);
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.CompletedAt);
    }

    [Fact]
    public void Notes_TooLong_Fails()
    {
        var request = new CompleteTaskRequest(null, new string('x', 2001), null);
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Notes);
    }
}

public class UpdateCompletionRequestValidatorTests
{
    private readonly UpdateCompletionRequestValidator _validator = new();

    [Fact]
    public void AllNulls_Passes()
    {
        var request = new UpdateCompletionRequest(null, null);
        _validator.TestValidate(request).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void FutureDate_Fails()
    {
        var request = new UpdateCompletionRequest(DateTime.UtcNow.AddDays(1), null);
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.CompletedAt);
    }
}

public class CreateCategoryRequestValidatorTests
{
    private readonly CreateCategoryRequestValidator _validator = new();

    [Fact]
    public void Valid_Request_Passes()
    {
        var request = new CreateCategoryRequest("Home", "🏠");
        _validator.TestValidate(request).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Empty_Name_Fails()
    {
        var request = new CreateCategoryRequest("", null);
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Name_TooLong_Fails()
    {
        var request = new CreateCategoryRequest(new string('x', 101), null);
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Name);
    }
}

public class UpdateCategoryRequestValidatorTests
{
    private readonly UpdateCategoryRequestValidator _validator = new();

    [Fact]
    public void Valid_Request_Passes()
    {
        var request = new UpdateCategoryRequest("Updated", "🌿", 2);
        _validator.TestValidate(request).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Empty_Name_Fails()
    {
        var request = new UpdateCategoryRequest("", null, null);
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Negative_SortOrder_Fails()
    {
        var request = new UpdateCategoryRequest("Cat", null, -1);
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.SortOrder);
    }
}

public class RegisterRequestValidatorTests
{
    private readonly RegisterRequestValidator _validator = new();

    [Fact]
    public void Valid_Request_Passes()
    {
        var request = new RegisterRequest("user@example.com", "SecurePassword1!");
        _validator.TestValidate(request).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Empty_Email_Fails()
    {
        var request = new RegisterRequest("", "SecurePassword1!");
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Invalid_Email_Fails()
    {
        var request = new RegisterRequest("not-an-email", "SecurePassword1!");
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Short_Password_Fails()
    {
        var request = new RegisterRequest("user@example.com", "short");
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Empty_Password_Fails()
    {
        var request = new RegisterRequest("user@example.com", "");
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Password);
    }
}

public class LoginRequestValidatorTests
{
    private readonly LoginRequestValidator _validator = new();

    [Fact]
    public void Valid_Request_Passes()
    {
        var request = new LoginRequest("user@example.com", "password");
        _validator.TestValidate(request).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Empty_Email_Fails()
    {
        var request = new LoginRequest("", "password");
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Empty_Password_Fails()
    {
        var request = new LoginRequest("user@example.com", "");
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Password);
    }
}
