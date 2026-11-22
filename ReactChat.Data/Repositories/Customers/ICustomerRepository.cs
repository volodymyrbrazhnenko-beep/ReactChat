using ReactChat.Domain;
using ReactChat.Data.Repositories.Customers.Views;

namespace ReactChat.Data.Repositories.Customers
{
    public interface ICustomerRepository : IBaseRepository<Customer>
    {
        Task<bool> ExistsAsync(string email);
        Task<Customer?> GetCustomerByEmailAsync(string email);
        Task<CustomerView?> GetCustomerViewAsync(int id);
    }
}
