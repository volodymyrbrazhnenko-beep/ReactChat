using Microsoft.EntityFrameworkCore;
using ReactChat.Domain;
using ReactChat.Data.Repositories.Customers.Views;
using ReactChat.Data.Uow;

namespace ReactChat.Data.Repositories.Customers
{
    public sealed class CustomerRepository : BaseRepository<Customer>, ICustomerRepository
    {
        private readonly IUnitOfWork _uow;

        public CustomerRepository(ApplicationDbContext context, IUnitOfWork uow) : base(context)
        {
            _uow = uow;
        }

        public async Task<Customer?> GetCustomerByEmailAsync(string email)
        {
            email = email.Trim();

            return await Source
                .Where(item => item.Email == email)
                .FirstOrDefaultAsync();
        }

        public async Task<CustomerView?> GetCustomerViewAsync(int id)
        {
            return await Source
                .Where(item => item.Id == id)
                .Select(item => new CustomerView
                {
                    Id = item.Id,
                    UserName = item.UserName,
                    Email = item.Email,
                    Icon = item.Icon,
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> ExistsAsync(string email)
        {
            return await Source.AnyAsync(x => x.Email == email);
        }

    }
}
