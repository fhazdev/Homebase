using System.Security.Claims;
using HomeBase.Application.DTOs.Dashboard;
using HomeBase.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeBase.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController(TaskService taskService) : ControllerBase
{
    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Get([FromQuery] int days = 7)
    {
        var (overdue, upcoming, recent) = await taskService.GetDashboardDataAsync(UserId, days);

        var recentCompletions = recent
            .Select(x => new RecentCompletionDto(
                x.Task.Id, x.Task.Name, x.Task.Icon,
                x.Log.CompletedAt, x.Log.Notes))
            .ToList();

        return Ok(new DashboardDto(overdue, upcoming, recentCompletions));
    }
}
