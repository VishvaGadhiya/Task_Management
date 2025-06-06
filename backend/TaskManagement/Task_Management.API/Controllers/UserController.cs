﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;
using Task_Management.Interfaces.Interfaces;
using Task_Management.Shared.DTOs;

namespace Task_Management.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }


        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
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


        [HttpPost("GetPaginated")]
        public async Task<IActionResult> GetPaginatedUsers([FromBody] UserDataTableRequest request)
        {
            var result = await _userService.GetUsersPaginatedAsync(request);

            var mappedData = result.Data.Select(u => new
            {
                id = u.Id,
                name = u.Name,
                gender = u.Gender,
                joinDate = u.JoinDate.ToString("yyyy-MM-dd"),
                status = u.Status == "Active" ? "Active" : "Deactive"
            }).ToList();

            return Ok(new
            {
                draw = result.Draw,
                recordsTotal = result.RecordsTotal,
                recordsFiltered = result.RecordsFiltered,
                data = mappedData
            });
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create(CreateOrEditUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _userService.CreateUserAsync(dto);

            if (!result)
            {
                ModelState.AddModelError("Name", "A user with the same Name and Gender already exists.");
                return BadRequest(ModelState);
            }

            return Ok(new { success = true });
        }

        [HttpGet("Edit/{id}")]
        public async Task<IActionResult> Edit(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null) return NotFound();

            var dto = new CreateOrEditUserDto
            {
                Id = user.Id,
                Name = user.Name,
                Gender = user.Gender,
                JoinDate = user.JoinDate,
                Status = user.Status
            };

            return Ok(dto);
        }

        [HttpPut("Edit")]
        public async Task<IActionResult> Edit(CreateOrEditUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (success, errorMessage) = await _userService.UpdateUserAsync(dto);

            if (!success)
            {
                if (!string.IsNullOrEmpty(errorMessage))
                    return BadRequest(new { success = false, message = errorMessage });

                ModelState.AddModelError("Name", "A user with the same Name and Gender already exists.");
                return BadRequest(ModelState);
            }

            return Ok(new { success = true });
        }



        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _userService.DeleteUserAsync(id);
            if (!result)
                return BadRequest(new { success = false, message = "Cannot delete user. All assigned tasks must be completed first." });

            return Ok(new { success = true });
        }

    }
}
