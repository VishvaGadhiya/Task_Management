using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Task_Management.Interfaces.Interfaces;
using Task_Management.Shared.DTOs;

namespace Task_Management.API.Controllers
{
    [Authorize(Roles = "User")]

    [ApiController]
    [Route("api/[controller]")]
    public class MyTasksController : ControllerBase
    {
        private readonly IMyTaskService _myTaskService;

        public MyTasksController(IMyTaskService myTaskService)
        {
            _myTaskService = myTaskService;
        }

        [HttpGet("my-tasks")]
        public async Task<IActionResult> GetMyTasks()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdStr))
                return Unauthorized();

            if (!int.TryParse(userIdStr, out int userId))
                return BadRequest("Invalid user ID format.");

            var tasks = await _myTaskService.GetTasksByUserIdAsync(userId);

            var result = tasks.Select(ut => new
            {
                ut.Id,
                ut.TaskId,
                ut.Task.Title,
                ut.Task.Description,
                ut.Task.DueDate,
                ut.Task.Status
            });

            return Ok(result);
        }
        [HttpPost("paginated")]
        public async Task<IActionResult> GetPaginatedUserTasks([FromBody] MyTaskDataTableRequest request)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr))
                return Unauthorized();

            if (!int.TryParse(userIdStr, out int userId))
                return BadRequest("Invalid user ID format.");

            var result = await _myTaskService.GetPaginatedTasksByUserAsync(userId, request);

            return Ok(new
            {
                draw = result.Draw,
                recordsTotal = result.RecordsTotal,
                recordsFiltered = result.RecordsFiltered,
                data = result.Data
            });
        }



        [HttpPut("update-status/{taskId}")]
        public async Task<IActionResult> UpdateTaskStatus(int taskId, [FromBody] string newStatus)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdStr))
                return Unauthorized();

            if (!int.TryParse(userIdStr, out int userId))
                return BadRequest("Invalid user ID format.");

            var success = await _myTaskService.UpdateTaskStatusAsync(taskId, userId, newStatus);
            if (!success) return NotFound("Task not found or not assigned to user.");

            return Ok("Status updated successfully.");
        }
    }
}
