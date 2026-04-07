using System.Net;
using System.Net.Http.Json;
using HomeBase.Api.Tests.Helpers;
using HomeBase.Application.DTOs.Categories;
using HomeBase.Application.DTOs.Tasks;
using HomeBase.Domain.Enums;

namespace HomeBase.Api.Tests.Controllers;

public class TasksControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public TasksControllerTests(CustomWebApplicationFactory factory) => _factory = factory;

    private async Task<(HttpClient Client, Guid CategoryId)> SetupAsync()
    {
        var client = await AuthHelper.CreateAuthenticatedClientAsync(
            _factory, $"tasks-{Guid.NewGuid()}@test.com");
        var cats = await client.GetFromJsonAsync<List<CategoryDto>>("/api/categories");
        return (client, cats![0].Id);
    }

    [Fact]
    public async Task GetAll_Unauthenticated_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/tasks");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_Empty_ReturnsEmptyList()
    {
        var (client, _) = await SetupAsync();
        var response = await client.GetAsync("/api/tasks");
        response.EnsureSuccessStatusCode();
        var tasks = await response.Content.ReadFromJsonAsync<List<TaskDto>>();
        Assert.NotNull(tasks);
        Assert.Empty(tasks);
    }

    [Fact]
    public async Task Create_ValidRequest_ReturnsCreated()
    {
        var (client, catId) = await SetupAsync();

        var response = await client.PostAsJsonAsync("/api/tasks",
            new CreateTaskRequest("Change Oil", "🛢️", 3, RecurrenceUnit.Months, null, null, catId));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var task = await response.Content.ReadFromJsonAsync<TaskDto>();
        Assert.NotNull(task);
        Assert.Equal("Change Oil", task.Name);
    }

    [Fact]
    public async Task GetById_ReturnsDetail()
    {
        var (client, catId) = await SetupAsync();

        var createResp = await client.PostAsJsonAsync("/api/tasks",
            new CreateTaskRequest("Mow Lawn", "🌿", 1, RecurrenceUnit.Weeks, null, null, catId));
        var created = await createResp.Content.ReadFromJsonAsync<TaskDto>();

        var response = await client.GetAsync($"/api/tasks/{created!.Id}");
        response.EnsureSuccessStatusCode();
        var detail = await response.Content.ReadFromJsonAsync<TaskDetailDto>();
        Assert.Equal("Mow Lawn", detail!.Name);
        Assert.Empty(detail.Completions);
    }

    [Fact]
    public async Task Update_ValidRequest_ReturnsUpdated()
    {
        var (client, catId) = await SetupAsync();

        var createResp = await client.PostAsJsonAsync("/api/tasks",
            new CreateTaskRequest("Task", null, 1, RecurrenceUnit.Days, null, null, catId));
        var created = await createResp.Content.ReadFromJsonAsync<TaskDto>();

        var response = await client.PutAsJsonAsync($"/api/tasks/{created!.Id}",
            new UpdateTaskRequest("Updated Task", null, null, null, null, null, null, null));

        response.EnsureSuccessStatusCode();
        var updated = await response.Content.ReadFromJsonAsync<TaskDto>();
        Assert.Equal("Updated Task", updated!.Name);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent()
    {
        var (client, catId) = await SetupAsync();

        var createResp = await client.PostAsJsonAsync("/api/tasks",
            new CreateTaskRequest("To Delete", null, 1, RecurrenceUnit.Days, null, null, catId));
        var created = await createResp.Content.ReadFromJsonAsync<TaskDto>();

        var response = await client.DeleteAsync($"/api/tasks/{created!.Id}");
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Complete_AddsCompletion()
    {
        var (client, catId) = await SetupAsync();

        var createResp = await client.PostAsJsonAsync("/api/tasks",
            new CreateTaskRequest("Task", null, 1, RecurrenceUnit.Weeks, null, null, catId));
        var created = await createResp.Content.ReadFromJsonAsync<TaskDto>();

        var response = await client.PostAsJsonAsync($"/api/tasks/{created!.Id}/complete",
            new CompleteTaskRequest(null, "Done!", null));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var log = await response.Content.ReadFromJsonAsync<CompletionLogDto>();
        Assert.Equal("Done!", log!.Notes);
    }

    [Fact]
    public async Task DeleteCompletion_ReturnsNoContent()
    {
        var (client, catId) = await SetupAsync();

        var createResp = await client.PostAsJsonAsync("/api/tasks",
            new CreateTaskRequest("Task", null, 1, RecurrenceUnit.Weeks, null, null, catId));
        var task = await createResp.Content.ReadFromJsonAsync<TaskDto>();

        var completeResp = await client.PostAsJsonAsync($"/api/tasks/{task!.Id}/complete",
            new CompleteTaskRequest(null, null, null));
        var log = await completeResp.Content.ReadFromJsonAsync<CompletionLogDto>();

        var response = await client.DeleteAsync(
            $"/api/tasks/{task.Id}/completions/{log!.Id}");
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_WithCategoryFilter_FiltersResults()
    {
        var (client, catId) = await SetupAsync();

        // Create a task in the first category
        await client.PostAsJsonAsync("/api/tasks",
            new CreateTaskRequest("Task1", null, 1, RecurrenceUnit.Days, null, null, catId));

        // Get all tasks - should have 1
        var all = await client.GetFromJsonAsync<List<TaskDto>>("/api/tasks");
        Assert.Single(all!);

        // Get with a random category filter - should have 0
        var filtered = await client.GetFromJsonAsync<List<TaskDto>>(
            $"/api/tasks?categoryId={Guid.NewGuid()}");
        Assert.Empty(filtered!);
    }
}
