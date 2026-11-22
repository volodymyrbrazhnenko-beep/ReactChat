using Microsoft.EntityFrameworkCore;
using ReactChat.Domain;

namespace ReactChat.Data.Repositories
{
    public abstract class BaseRepository<TEntity> : IBaseRepository<TEntity> where TEntity : BaseEntity
    {
        protected ApplicationDbContext Context { get; }

        public DbSet<TEntity> Source => Context.Set<TEntity>();

        protected BaseRepository(ApplicationDbContext context)
        {
            Context = context;
        }

        public Task SaveAsync() => Context.SaveChangesAsync();

        public void AddRange(IEnumerable<TEntity> entities) => Source.AddRange(entities);
        public void Add(TEntity entity) => Source.Add(entity);
        public void Remove(TEntity entity) => Source.Remove(entity);
        public void RemoveRange(IEnumerable<TEntity> entities) => Source.RemoveRange(entities);
        public async Task<TEntity> GetEntityAsync(int id)
        {
            var entity = await Source.FirstOrDefaultAsync(e => e.Id == id);
            return entity;
        } 
    }
}
