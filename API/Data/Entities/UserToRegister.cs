using System.ComponentModel.DataAnnotations.Schema;

namespace API.Data.Entities
{
    public class UserToRegister
    {
        public required string Username { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required int Role { get; set; }
        public Guid? ProjectId { get; set; }

        [NotMapped]
        public object? Site { get; set; }

        [NotMapped]
        public object? ProjectsA { get; set; }
    }
}
