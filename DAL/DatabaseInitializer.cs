// =============================
// Email: info@somesite.com
// www.somesite.com/templates
// =============================

using DAL.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Core;
using DAL.Core.Interfaces;

namespace DAL
{
    public interface IDatabaseInitializer
    {
        Task SeedAsync();
    }




    public class DatabaseInitializer : IDatabaseInitializer
    {
        private readonly ApplicationDbContext _context;
        private readonly IAccountManager _accountManager;
        private readonly ILogger _logger;
        private readonly string _defaultRoleName;

        public DatabaseInitializer(ApplicationDbContext context, IAccountManager accountManager, ILogger<DatabaseInitializer> logger)
        {
            _accountManager = accountManager;
            _context = context;
            _logger = logger;
        }

        public DatabaseInitializer(ApplicationDbContext context, IAccountManager accountManager, ILogger<DatabaseInitializer> logger, string defaultRoleName)
            : this(context, accountManager, logger)
        {
            _defaultRoleName = defaultRoleName;
        }


        virtual public async Task SeedAsync()
        {
            await _context.Database.MigrateAsync().ConfigureAwait(false);

            if (!await _context.Users.AnyAsync())
            {
                _logger.LogInformation("Generating inbuilt accounts");

                const string adminRoleName = "administrator";
                const string userRoleName = "user";

                await EnsureRoleAsync(adminRoleName, "Default administrator", ApplicationPermissions.GetAllPermissionValues());
                await EnsureRoleAsync(userRoleName, "Default user", new string[] { });

                if (!string.IsNullOrWhiteSpace(_defaultRoleName))
                    await EnsureRoleAsync(_defaultRoleName, "Default public role", new string[] { });

                await CreateUserAsync("admin", "tempP@ss123", "Inbuilt Administrator", "erickzarza@gmail.com", "+1 (123) 000-0000", new string[] { adminRoleName });
                await CreateUserAsync("user", "tempP@ss123", "Inbuilt Standard User", "user@somesite.com", "+1 (123) 000-0001", new string[] { userRoleName });
                await CreateUserAsync("jesse", "tempP@ss123", "Inbuilt Administrator", "jesse.read @theorem.co", "+1 (123) 000-0001", new string[] { userRoleName });
                await CreateUserAsync("ekzace", "tempP@ss123", "Inbuilt Administrator", "erickzarza@hotmail.com", "+1 (123) 000-0001", new string[] { userRoleName });


                
                _logger.LogInformation("Inbuilt account generation completed");
            }



            if (!await _context.Customers.AnyAsync() && !await _context.ProductCategories.AnyAsync())
            {
                _logger.LogInformation("Seeding initial data");

                Customer cust_1 = new Customer
                {
                    Name = "Ebenezer Monney",
                    Email = "contact@somesite.com",
                    Gender = Gender.Male,
                    DateCreated = DateTime.UtcNow,
                    DateModified = DateTime.UtcNow
                };

                Customer cust_2 = new Customer
                {
                    Name = "Itachi Uchiha",
                    Email = "uchiha@narutoverse.com",
                    PhoneNumber = "+81123456789",
                    Address = "Some fictional Address, Street 123, Konoha",
                    City = "Konoha",
                    Gender = Gender.Male,
                    DateCreated = DateTime.UtcNow,
                    DateModified = DateTime.UtcNow
                };

                Customer cust_3 = new Customer
                {
                    Name = "John Doe",
                    Email = "johndoe@anonymous.com",
                    PhoneNumber = "+18585858",
                    Address = @"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.
                    Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet",
                    City = "Lorem Ipsum",
                    Gender = Gender.Male,
                    DateCreated = DateTime.UtcNow,
                    DateModified = DateTime.UtcNow
                };

                Customer cust_4 = new Customer
                {
                    Name = "Jane Doe",
                    Email = "Janedoe@anonymous.com",
                    PhoneNumber = "+18585858",
                    Address = @"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.
                    Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet",
                    City = "Lorem Ipsum",
                    Gender = Gender.Male,
                    DateCreated = DateTime.UtcNow,
                    DateModified = DateTime.UtcNow
                };



                ProductCategory prodCat_1 = new ProductCategory
                {
                    Name = "None",
                    Description = "Default category. Products that have not been assigned a category",
                    DateCreated = DateTime.UtcNow,
                    DateModified = DateTime.UtcNow
                };



                Product prod_1 = new Product
                {
                    Name = "BMW M6",
                    Description = "Yet another masterpiece from the world's best car manufacturer",
                    BuyingPrice = 109775,
                    SellingPrice = 114234,
                    UnitsInStock = 12,
                    IsActive = true,
                    ProductCategory = prodCat_1,
                    DateCreated = DateTime.UtcNow,
                    DateModified = DateTime.UtcNow
                };

                Product prod_2 = new Product
                {
                    Name = "Nissan Patrol",
                    Description = "A true man's choice",
                    BuyingPrice = 78990,
                    SellingPrice = 86990,
                    UnitsInStock = 4,
                    IsActive = true,
                    ProductCategory = prodCat_1,
                    DateCreated = DateTime.UtcNow,
                    DateModified = DateTime.UtcNow
                };



                Order ordr_1 = new Order
                {
                    Discount = 500,
                    Cashier = await _context.Users.FirstAsync(),
                    Customer = cust_1,
                    DateCreated = DateTime.UtcNow,
                    DateModified = DateTime.UtcNow,
                    OrderDetails = new List<OrderDetail>()
                    {
                        new OrderDetail() {UnitPrice = prod_1.SellingPrice, Quantity=1, Product = prod_1 },
                        new OrderDetail() {UnitPrice = prod_2.SellingPrice, Quantity=1, Product = prod_2 },
                    }
                };

                Order ordr_2 = new Order
                {
                    Cashier = await _context.Users.FirstAsync(),
                    Customer = cust_2,
                    DateCreated = DateTime.UtcNow,
                    DateModified = DateTime.UtcNow,
                    OrderDetails = new List<OrderDetail>()
                    {
                        new OrderDetail() {UnitPrice = prod_2.SellingPrice, Quantity=1, Product = prod_2 },
                    }
                };


                _context.Customers.Add(cust_1);
                _context.Customers.Add(cust_2);
                _context.Customers.Add(cust_3);
                _context.Customers.Add(cust_4);

                _context.Products.Add(prod_1);
                _context.Products.Add(prod_2);

                _context.Orders.Add(ordr_1);
                _context.Orders.Add(ordr_2);

                await _context.SaveChangesAsync();

                _logger.LogInformation("Seeding initial data completed");
            }

            if (!await _context.Devices.AnyAsync())
            {
                _logger.LogInformation("Seeding initial data");

                Device device_1 = new Device
                {
                    Name = "AC Device Upstaris",
                    SerialNumber = "sr05983",
                    RegistrationDate = DateTime.UtcNow,
                    FirmwareVersion = "fv1234"
                };

                Device device_2 = new Device
                {
                    Name = "AC Device Downstairs",
                    SerialNumber = "sr05984",
                    RegistrationDate = DateTime.UtcNow,
                    FirmwareVersion = "fv1233"
                };

                Device device_3 = new Device
                {
                    Name = "AC Device Garage",
                    SerialNumber = "sr05985",
                    RegistrationDate = DateTime.UtcNow,
                    FirmwareVersion = "fv1236"
                };

                Device device_4 = new Device
                {
                    Name = "AC Device Basement",
                    SerialNumber = "sr05986",
                    RegistrationDate = DateTime.UtcNow,
                    FirmwareVersion = "fv1265"
                };

                Device device_5 = new Device
                {
                    Name = "AC Device P",
                    SerialNumber = "sr05433",
                    RegistrationDate = DateTime.UtcNow,
                    FirmwareVersion = "fv1dd34"
                };

                Device device_6 = new Device
                {
                    Name = "AC Device 09",
                    SerialNumber = "sr056d84",
                    RegistrationDate = DateTime.UtcNow,
                    FirmwareVersion = "fv1ddfd33"
                };

                Device device_7 = new Device
                {
                    Name = "AC Device ACp",
                    SerialNumber = "sr0dfd85",
                    RegistrationDate = DateTime.UtcNow,
                    FirmwareVersion = "fv1dfs6"
                };

                Device device_8 = new Device
                {
                    Name = "AC Device BBB",
                    SerialNumber = "sr0fd6",
                    RegistrationDate = DateTime.UtcNow,
                    FirmwareVersion = "fvfd65"
                };

                Device device_9 = new Device
                {
                    Name = "AC Device Upstaris",
                    SerialNumber = "sr05983",
                    RegistrationDate = DateTime.UtcNow,
                    FirmwareVersion = "fv1234"
                };

                Device device_10 = new Device
                {
                    Name = "AC Device AAA",
                    SerialNumber = "sr05f84",
                    RegistrationDate = DateTime.UtcNow,
                    FirmwareVersion = "fvfdds33"
                };

             

                _context.Devices.Add(device_1);
                _context.Devices.Add(device_2);
                _context.Devices.Add(device_3);
                _context.Devices.Add(device_4);
                _context.Devices.Add(device_5);
                _context.Devices.Add(device_6);
                _context.Devices.Add(device_7);
                _context.Devices.Add(device_8);
                _context.Devices.Add(device_9);
                _context.Devices.Add(device_10);



                await _context.SaveChangesAsync();

                _logger.LogInformation("Seeding initial data completed");
            }
        }



        private async Task EnsureRoleAsync(string roleName, string description, string[] claims)
        {
            if ((await _accountManager.GetRoleByNameAsync(roleName)) == null)
            {
                ApplicationRole applicationRole = new ApplicationRole(roleName, description);

                var result = await this._accountManager.CreateRoleAsync(applicationRole, claims);

                if (!result.Succeeded)
                    throw new Exception($"Seeding \"{description}\" role failed. Errors: {string.Join(Environment.NewLine, result.Errors)}");
            }
        }

        private async Task<ApplicationUser> CreateUserAsync(string userName, string password, string fullName, string email, string phoneNumber, string[] roles)
        {
            ApplicationUser applicationUser = new ApplicationUser
            {
                UserName = userName,
                FullName = fullName,
                Email = email,
                PhoneNumber = phoneNumber,
                EmailConfirmed = true,
                IsEnabled = true
            };

            var result = await _accountManager.CreateUserAsync(applicationUser, roles, password);

            if (!result.Succeeded)
                throw new Exception($"Seeding \"{userName}\" user failed. Errors: {string.Join(Environment.NewLine, result.Errors)}");


            return applicationUser;
        }
    }
}
