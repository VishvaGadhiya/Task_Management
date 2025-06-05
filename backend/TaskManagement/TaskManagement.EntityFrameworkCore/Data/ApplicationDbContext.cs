using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Task_Management.Shared;

namespace TaskManagement.EntityFrameworkCore.Data.Data
{
    public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<int>, int>
    {
        public ApplicationDbContext(DbContextOptions options) : base(options)
        {
        }
        public DbSet<Tasks> Tasks { get; set; }
        public DbSet<UserTask> UserTasks { get; set; }


    }
}
