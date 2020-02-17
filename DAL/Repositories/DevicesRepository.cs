using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DAL.Models;
using DAL.Repositories.Interfaces;

namespace DAL.Repositories
{
    public class DevicesRepository : Repository<Device>, IDeviceRepository
    {
        public DevicesRepository(ApplicationDbContext context) : base(context)
        { }


        public IEnumerable<Device> GetTopActiveDevices(int count)
        {
            throw new NotImplementedException();
        }


        public IEnumerable<Device> GetAllDevicesData()
        {
            return _appContext.Devices
                //.Include(c => c.Orders).ThenInclude(o => o.OrderDetails).ThenInclude(d => d.Product)
                //.Include(c => c.Orders).ThenInclude(o => o.Cashier)
                .OrderBy(c => c.Name)
                .ToList();
        }



        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;
    }
}
