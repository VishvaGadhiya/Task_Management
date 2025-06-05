using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Task_Management.Interfaces.Interfaces;
using Task_Management.Shared.DTOs;

namespace Task_Management.API.Controllers
{
    [Authorize(Roles = "Admin")]

    [ApiController]
    [Route("api/[controller]")]
    public class ManagerController : ControllerBase
    {
        private readonly IManagerService _managerService;

        public ManagerController(IManagerService managerService)
        {
            _managerService = managerService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var managers = await _managerService.GetAllAsync();
            return Ok(managers);
        }

        [HttpPost("GetPaginated")]
        public async Task<IActionResult> GetPaginated([FromBody] ManagerDataTableRequest request)
        {
            var result = await _managerService.GetPaginatedAsync(request);

            return Ok(new
            {
                draw = result.Draw,
                recordsTotal = result.RecordsTotal,
                recordsFiltered = result.RecordsFiltered,
                data = result.Data
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var manager = await _managerService.GetByIdAsync(id);
            if (manager == null)
                return NotFound();

            return Ok(manager);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ManagerViewModel manager)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _managerService.CreateAsync(manager);
                return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ManagerViewModel manager)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var success = await _managerService.UpdateAsync(id, manager);
            if (!success)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _managerService.DeleteAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}
