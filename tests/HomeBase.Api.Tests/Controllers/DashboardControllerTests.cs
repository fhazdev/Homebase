using System.Net;
using System.Net.Http.Json;
using HomeBase.Api.Tests.Helpers;
using HomeBase.Application.DTOs.Categories;
using HomeBase.Application.DTOs.Dashboard;
using HomeBase.Application.DTOs.Tasks;
using HomeBase.Domain.Enums;

namespace HomeBase.Api.Tests.Controllers;

public class DashboardControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public DashboardControllerTests(CustomWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task Get_Unauthenticated_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/dashboard");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Get_Empty_ReturnsEmptyDashboard()
    {
        var client = await AuthHelper.CreateAuthenticatedClientAsync(
            _factory, $"dash-empty-{Guid.NewGuid()}@test.com");

        var response = await client.GetAsync("/api/dashboard");
        response.EnsureSuccessStatusCode();
        var dashboard = await response.Content.ReadFromJsonAsync<DashboardDto>();
        Assert.NotNull(dashboard);
        Assert.Empty(dashboard.OverdueTasks);
        Assert.Empty(dashboard.UpcomingTasks);
        Assert.Empty(dashboard.RecentCompletions);
    }

    [Fact]
    public async Task Get_WithOverdueTask_ReturnsInOverdue()
    {
        var client = await AuthHelper.CreateAuthenticatedClientAsync(
            _factory, $"dash-overdue-{Guid.NewGuid()}@test.com");
        var cats = await client.GetFromJsonAsync<List<CategoryDto>>("/api/categories");

        // Create a task with a past first due date
        await client.PostAsJsonAsync("/api/tasks",
            new CreateTaskRequest("Overdue Task", null, 1, RecurrenceUnit.Days, null,
                DateTime.UtcNow.AddDays(-10), cats![0].Id));

        var response = await client.GetAsync("/api/dashboard");
        response.EnsureSuccessStatusCode();
        var dashboard = await response.Content.ReadFromJsonAsync<DashboardDto>();
        Assert.Single(dashboard!.OverdueTasks);
    }

    [Fact]
    public async Task Get_WithRecentCompletion_ReturnsInRecent()
    {
        var client = await AuthHelper.CreateAuthenticatedClientAsync(
            _factory, $"dash-recent-{Guid.NewGuid()}@test.com");
        var cats = await client.GetFromJsonAsync<List<CategoryDto>>("/api/categories");

        // Create and complete a task
        var createResp = await client.PostAsJsonAsync("/api/tasks",
            new CreateTaskRequest("Task", null, 1, RecurrenceUnit.Weeks, null, null, cats![0].Id));
        var task = await createResp.Content.ReadFromJsonAsync<TaskDto>();

        await client.PostAsJsonAsync($"/api/tasks/{task!.Id}/complete",
            new CompleteTaskRequest(null, "completed", null));

        var response = await client.GetAsync("/api/dashboard");
        response.EnsureSuccessStatusCode();
        var dashboard = await response.Content.ReadFromJsonAsync<DashboardDto>();
        Assert.Single(dashboard!.RecentCompletions);
        Assert.Equal("completed", dashboard.RecentCompletions[0].Notes);
    }
}
