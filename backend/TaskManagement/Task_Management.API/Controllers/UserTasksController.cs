using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

using Task_Management.Interfaces.Interfaces;
using Task_Management.Shared.DTOs;
using TaskManagement.EntityFrameworkCore.Data.Data;

namespace Task_Management.API.Controllers
{
    [Authorize(Roles = "Admin,Manager")]

    [Route("api/[controller]")]
    [ApiController]
    public class UserTasksController : ControllerBase
    {
        private readonly IUserTaskService _userTaskService;
        private readonly ApplicationDbContext _context;


        public UserTasksController(IUserTaskService userTaskService, ApplicationDbContext context)
        {
            _userTaskService = userTaskService;
            _context = context;

        }

        [HttpGet("StatusSummary")]
        public async Task<IActionResult> GetStatusSummary()
        {
            var summary = await _userTaskService.GetUserTaskStatusSummaryAsync();
            return Ok(summary);
        }

        [HttpGet]
        public async Task<IActionResult> GetUserTasks()
        {
            var userTasks = await _context.UserTasks
                .Include(ut => ut.User)
                .Include(ut => ut.Task)
                .ToListAsync();

            var result = userTasks.Select(ut => new
            {
                ut.Id,
                ut.UserId,
                ut.TaskId,
                User = new { ut.User.Id, ut.User.Name },
                Task = new { ut.Task.Id, ut.Task.Title }
            });

            return Ok(result);
        }

        [HttpPost("GetPaginated")]
        public async Task<IActionResult> GetPaginated([FromBody] UserTaskDataTableRequest request)
        {
            var result = await _userTaskService.GetPaginatedAsync(request);

            return Ok(new
            {
                draw = result.Draw,
                recordsTotal = result.RecordsTotal,
                recordsFiltered = result.RecordsFiltered,
                data = result.Data.Select(ut => new
                {
                    id = ut.Id,
                    userId = ut.UserId,
                    taskId = ut.TaskId,
                    userName = ut.UserName,
                    taskTitle = ut.TaskTitle
                })
            });
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _userTaskService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateOrEditUserTaskDto dto)
        {
            var created = await _userTaskService.AddAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateOrEditUserTaskDto dto)
        {
            if (id != dto.Id) return BadRequest("ID mismatch");
            var updated = await _userTaskService.UpdateAsync(dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _userTaskService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userTaskService.GetAllUsersAsync();
            // Map to DTO or anonymous if needed (example here)
            var result = users.Select(u => new
            {
                id = u.Id,
                name = u.Name,
                gender = u.Gender,
                joinDate = u.JoinDate.ToString("yyyy-MM-dd"),
                status = u.Status == "Active" ? "Active" : "Deactive"
            });
            return Ok(result);
        }

        [HttpGet("tasks")]
        public async Task<IActionResult> GetAll()
        {
            var tasks = await _userTaskService.GetAllTasksAsync();
            return Ok(tasks);
        }

       



    }
}
