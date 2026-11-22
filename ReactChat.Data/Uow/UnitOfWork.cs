using Dapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using ReactChat.Data.Repositories.ChatMessages;
using ReactChat.Data.Repositories.Customers;
using System.Data;
using System.Data.Common;

namespace ReactChat.Data.Uow
{
    public class UnitOfWork : IUnitOfWork
    {
        private bool _disposed;

        private readonly IDictionary<string, object> _repositories;
        private readonly ILogger<UnitOfWork> _logger;

        #region Repositories
        public ICustomerRepository CustomerRepository => GetRepository<ICustomerRepository>();
        public IChatMessageRepository ChatMessageRepository => GetRepository<IChatMessageRepository>();

        #endregion


        public DbConnection Connection => Context.Database.GetDbConnection();
        public ApplicationDbContext Context { get; set; }
        private IDbTransaction Transaction => Context.Database.CurrentTransaction?.GetDbTransaction();
        
        public UnitOfWork(ApplicationDbContext context, ILogger<UnitOfWork> logger)
        {
            Context = context ?? throw new ArgumentNullException(nameof(context));
            _repositories = new Dictionary<string, object>();
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<List<T>> QueryAsync<T>(string sql, object param)
        {
            return (await Connection.QueryAsync<T>(sql, param, Transaction)).ToList();
        }

        public async Task<T> QueryFirstAsync<T>(string sql, object param)
        {
            return await Connection.QueryFirstAsync<T>(sql, param, Transaction);
        }

        public async Task<T> QueryFirstOrDefaultAsync<T>(string sql, object param)
        {
            return await Connection.QueryFirstOrDefaultAsync<T>(sql, param, Transaction);
        }

        public async Task<T> StoredProcedureFirstAsync<T>(string name, object param)
        {
            return await Connection.QueryFirstAsync<T>(
                name,
                param,
                Transaction,
                commandType: CommandType.StoredProcedure);
        }

        public async Task StoredProcedureAsync(string name, object param)
        {
            await Connection.ExecuteAsync(name, param, Transaction, commandType: CommandType.StoredProcedure);
        }

        public async Task<List<T>> StoredProcedureAsync<T>(string name, object param)
        {
            return (await Connection.QueryAsync<T>(
                name,
                param,
                Transaction,
                commandType: CommandType.StoredProcedure)).ToList();
        }

        public IDbTransaction BeginTransaction(IsolationLevel isolationLevel = IsolationLevel.ReadCommitted)
        {
            return Context.Database.BeginTransaction(isolationLevel).GetDbTransaction();
        }

        public TRepository GetRepository<TRepository>() where TRepository : class
        {
            var type = typeof(TRepository);
            var typeFullName = type.FullName ?? throw new NullReferenceException("Type full name empty.");
            if (_repositories.ContainsKey(typeFullName))
            {
                _logger.LogDebug($"Cache hit for '{typeFullName}'.");
                return (TRepository)_repositories[typeFullName];
            }

            try
            {
                _logger.LogDebug($"Resolve '{typeFullName}' repository from services.");

                var repository = Context.GetService<TRepository>();
                if (repository is null)
                {
                    throw new NullReferenceException("Failed to resolve repository");
                }

                _logger.LogDebug($"Add '{typeFullName}' repository to cache.");

                _repositories[type.FullName] = repository;
                return repository;
            }
            catch (Exception ex)
            {
                _logger.LogCritical($"Failed to resolve {type.FullName} repository from services: {ex.Message}.");
                throw;
            }
        }

        public Task<int> CompleteAsync() => Context.SaveChangesAsync();

        #region Dispose
        public void Dispose()
        {
            Dispose(true);
        }

        private void Dispose(bool disposing)
        {
            if (!_disposed && disposing)
            {
                _repositories?.Clear();
                Context.Dispose();
            }

            _disposed = true;
        }

        #endregion
    }
}
