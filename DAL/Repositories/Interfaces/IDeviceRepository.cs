using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DAL.Repositories.Interfaces
{
    public interface IDeviceRepository : IRepository<Device>
    {
        IEnumerable<Device> GetTopActiveDevices(int count);
        IEnumerable<Device> GetAllDevicesData();
    }
}
