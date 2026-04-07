using HomeBase.Application.DTOs.Tasks;

namespace HomeBase.Application.DTOs.Dashboard;

public record DashboardDto(
    List<TaskDto> OverdueTasks,
    List<TaskDto> UpcomingTasks,
    List<RecentCompletionDto> RecentCompletions);

public record RecentCompletionDto(
    Guid TaskId,
    string TaskName,
    string TaskIcon,
    DateTime CompletedAt,
    string? Notes);
