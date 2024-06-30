using Microsoft.EntityFrameworkCore;
using API.Model;

namespace API.Context
{
    public class SoftGED_DBContext : DbContext
    {
        public SoftGED_DBContext(DbContextOptions<SoftGED_DBContext> options) : base(options) { }

        public DbSet<Project> Projects { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<Attachement> Attachements { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Document>().Property(x => x.Id).HasDefaultValueSql("NEWID()");
            modelBuilder.Entity<DocumentDynamicField>().HasKey(e => new { e.DocumentId, e.DynamicFieldId });
            modelBuilder.Entity<Project>().Property(x => x.Id).HasDefaultValueSql("NEWID()");
            modelBuilder.Entity<User>().Property(x => x.Id).HasDefaultValueSql("NEWID()");
            modelBuilder.Entity<DynamicField>().Property(x => x.Id).HasDefaultValueSql("NEWID()");
            modelBuilder.Entity<DynamicFieldItem>().Property(x => x.Id).HasDefaultValueSql("NEWID()");
            modelBuilder.Entity<Attachement>().Property(x => x.Id).HasDefaultValueSql("NEWID()");
        }
    }
}
