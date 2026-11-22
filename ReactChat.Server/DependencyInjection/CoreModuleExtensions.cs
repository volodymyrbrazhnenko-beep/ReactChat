using ReactChat.Services;
using ReactChat.Data.Repositories.Customers;
using ReactChat.Data.Uow;
using ReactChat.Data.Repositories.ChatMessages;

namespace ReactChat.Server.DependencyInjection
{
    public static class CoreModuleExtensions
    {
        public static IServiceCollection AddCoreModules(
            this IServiceCollection services, 
            IConfiguration configuration)
        {
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IChatService, ChatService>();

            return services
                .AddCustomerModule()
                .AddCompanyModule();
        }

        private static IServiceCollection AddCustomerModule(this IServiceCollection services)
        {
            services.AddScoped<ICustomerRepository, CustomerRepository>();
            return services;
        }

        private static IServiceCollection AddCompanyModule(this IServiceCollection services)
        {
            services.AddScoped<IChatMessageRepository, ChatMessageRepository>();
            return services;
        }
    }
}
