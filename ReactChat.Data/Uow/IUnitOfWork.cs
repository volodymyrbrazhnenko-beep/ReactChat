using ReactChat.Data.Repositories.ChatMessages;
using ReactChat.Data.Repositories.Customers;
using System.Data;

namespace ReactChat.Data.Uow
{
    public interface IUnitOfWork : IDisposable
    {
        public ApplicationDbContext Context { get; }
        public ICustomerRepository CustomerRepository { get; }
        public IChatMessageRepository ChatMessageRepository { get; }

        Task<int> CompleteAsync();

        Task<List<T>> QueryAsync<T>(string sql, object param);
        Task<T> QueryFirstOrDefaultAsync<T>(string sql, object param);

        Task StoredProcedureAsync(string name, object param);
        Task<List<T>> StoredProcedureAsync<T>(string name, object param);
        Task<T> StoredProcedureFirstAsync<T>(string name, object param);

        IDbTransaction BeginTransaction(IsolationLevel isolationLevel = IsolationLevel.ReadCommitted);

    }
}
