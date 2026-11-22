using Microsoft.EntityFrameworkCore;
using ReactChat.Domain;

namespace ReactChat.Data.Repositories
{
    public interface IBaseRepository<TEntity> where TEntity : BaseEntity
    {
        DbSet<TEntity> Source { get; }
        void Add(TEntity entity);
        void AddRange(IEnumerable<TEntity> entities);
        void Remove(TEntity entity);
        void RemoveRange(IEnumerable<TEntity> entities);
        Task SaveAsync();
        Task<TEntity> GetEntityAsync(int id);
    }

}
