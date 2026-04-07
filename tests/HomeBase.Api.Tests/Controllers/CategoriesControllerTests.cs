using System.Net;
using System.Net.Http.Json;
using HomeBase.Api.Tests.Helpers;
using HomeBase.Application.DTOs.Categories;

namespace HomeBase.Api.Tests.Controllers;

public class CategoriesControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public CategoriesControllerTests(CustomWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task GetAll_Unauthenticated_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/categories");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_Authenticated_ReturnsSeededCategories()
    {
        var client = await AuthHelper.CreateAuthenticatedClientAsync(
            _factory, $"cat-getall-{Guid.NewGuid()}@test.com");

        var response = await client.GetAsync("/api/categories");

        response.EnsureSuccessStatusCode();
        var categories = await response.Content.ReadFromJsonAsync<List<CategoryDto>>();
        Assert.NotNull(categories);
        // Registration seeds 3 default categories
        Assert.Equal(3, categories.Count);
    }

    [Fact]
    public async Task Create_ValidRequest_ReturnsCreated()
    {
        var client = await AuthHelper.CreateAuthenticatedClientAsync(
            _factory, $"cat-create-{Guid.NewGuid()}@test.com");

        var response = await client.PostAsJsonAsync("/api/categories",
            new CreateCategoryRequest("Garage", "🏗️"));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var category = await response.Content.ReadFromJsonAsync<CategoryDto>();
        Assert.NotNull(category);
        Assert.Equal("Garage", category.Name);
        Assert.Equal("🏗️", category.Icon);
    }

    [Fact]
    public async Task Update_ValidRequest_ReturnsOk()
    {
        var client = await AuthHelper.CreateAuthenticatedClientAsync(
            _factory, $"cat-update-{Guid.NewGuid()}@test.com");

        // Get seeded categories
        var cats = await client.GetFromJsonAsync<List<CategoryDto>>("/api/categories");
        var first = cats![0];

        var response = await client.PutAsJsonAsync($"/api/categories/{first.Id}",
            new UpdateCategoryRequest("Renamed", "🏡", null));

        response.EnsureSuccessStatusCode();
        var updated = await response.Content.ReadFromJsonAsync<CategoryDto>();
        Assert.Equal("Renamed", updated!.Name);
    }

    [Fact]
    public async Task Delete_WithReassignment_ReturnsNoContent()
    {
        var client = await AuthHelper.CreateAuthenticatedClientAsync(
            _factory, $"cat-delete-{Guid.NewGuid()}@test.com");

        var cats = await client.GetFromJsonAsync<List<CategoryDto>>("/api/categories");
        var toDelete = cats![0];
        var target = cats[1];

        var response = await client.DeleteAsync(
            $"/api/categories/{toDelete.Id}?reassignTo={target.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }
}
