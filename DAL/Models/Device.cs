using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.Models
{
    public class Device : AuditableEntity
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string SerialNumber { get; set; }
        public DateTime RegistrationDate { get; set; }
        public string FirmwareVersion { get; set; }

        //public ICollection<Order> Orders { get; set; }
    }
}
