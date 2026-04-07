using System.Security.Claims;
using HomeBase.Application.DTOs.Categories;
using HomeBase.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeBase.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController(CategoryService categoryService) : ControllerBase
{
    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetAll()
    {
        var categories = await categoryService.GetAllAsync(UserId);
        return Ok(categories);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryRequest request)
    {
        var category = await categoryService.CreateAsync(UserId, request);
        return CreatedAtAction(nameof(GetAll), category);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CategoryDto>> Update(Guid id, [FromBody] UpdateCategoryRequest request)
    {
        var category = await categoryService.UpdateAsync(UserId, id, request);
        return Ok(category);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, [FromQuery] Guid reassignTo)
    {
        await categoryService.DeleteAsync(UserId, id, reassignTo);
        return NoContent();
    }
}
