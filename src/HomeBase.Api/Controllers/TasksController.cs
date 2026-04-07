using System.Security.Claims;
using HomeBase.Application.DTOs.Tasks;
using HomeBase.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeBase.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController(TaskService taskService) : ControllerBase
{
    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<ActionResult<List<TaskDto>>> GetAll([FromQuery] Guid? categoryId)
    {
        var tasks = await taskService.GetAllAsync(UserId, categoryId);
        return Ok(tasks);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskDetailDto>> GetById(Guid id)
    {
        var task = await taskService.GetByIdAsync(UserId, id);
        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> Create([FromBody] CreateTaskRequest request)
    {
        var task = await taskService.CreateAsync(UserId, request);
        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TaskDto>> Update(Guid id, [FromBody] UpdateTaskRequest request)
    {
        var task = await taskService.UpdateAsync(UserId, id, request);
        return Ok(task);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await taskService.DeleteAsync(UserId, id);
        return NoContent();
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<ActionResult<CompletionLogDto>> Complete(Guid id, [FromBody] CompleteTaskRequest request)
    {
        var log = await taskService.CompleteAsync(UserId, id, request);
        return CreatedAtAction(nameof(GetById), new { id }, log);
    }

    [HttpPut("{id:guid}/completions/{logId:guid}")]
    public async Task<ActionResult<CompletionLogDto>> UpdateCompletion(
        Guid id, Guid logId, [FromBody] UpdateCompletionRequest request)
    {
        var log = await taskService.UpdateCompletionAsync(UserId, id, logId, request);
        return Ok(log);
    }

    [HttpDelete("{id:guid}/completions/{logId:guid}")]
    public async Task<IActionResult> DeleteCompletion(Guid id, Guid logId)
    {
        await taskService.DeleteCompletionAsync(UserId, id, logId);
        return NoContent();
    }
}
