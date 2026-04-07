using System.Security.Claims;
using HomeBase.Application.DTOs.Lists;
using HomeBase.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeBase.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ListsController(UserListService listService) : ControllerBase
{
    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<ActionResult<List<UserListDto>>> GetAll()
    {
        var lists = await listService.GetAllAsync(UserId);
        return Ok(lists);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserListDetailDto>> GetById(Guid id)
    {
        var list = await listService.GetByIdAsync(UserId, id);
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<UserListDto>> Create([FromBody] CreateUserListRequest request)
    {
        var list = await listService.CreateAsync(UserId, request);
        return CreatedAtAction(nameof(GetById), new { id = list.Id }, list);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UserListDto>> Update(Guid id, [FromBody] UpdateUserListRequest request)
    {
        var list = await listService.UpdateAsync(UserId, id, request);
        return Ok(list);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await listService.DeleteAsync(UserId, id);
        return NoContent();
    }

    // ── Items ───────────────────────────────────────────────────────────────

    [HttpPost("{id:guid}/items")]
    public async Task<ActionResult<ListItemDto>> AddItem(Guid id, [FromBody] CreateListItemRequest request)
    {
        var item = await listService.AddItemAsync(UserId, id, request);
        return CreatedAtAction(nameof(GetById), new { id }, item);
    }

    [HttpPut("{id:guid}/items/{itemId:guid}")]
    public async Task<ActionResult<ListItemDto>> UpdateItem(Guid id, Guid itemId, [FromBody] UpdateListItemRequest request)
    {
        var item = await listService.UpdateItemAsync(UserId, id, itemId, request);
        return Ok(item);
    }

    [HttpDelete("{id:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> DeleteItem(Guid id, Guid itemId)
    {
        await listService.DeleteItemAsync(UserId, id, itemId);
        return NoContent();
    }
}
