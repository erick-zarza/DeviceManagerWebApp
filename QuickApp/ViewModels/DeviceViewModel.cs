using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace QuickApp.ViewModels
{
    public class DeviceViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string SerialNumber { get; set; }
        public DateTime RegistrationDate { get; set; }
        public string FirmwareVersion { get; set; }
    }




    //public class DeviceViewModelValidator : AbstractValidator<CustomerViewModel>
    //{
    //    public DeviceViewModelValidator()
    //    {
    //        RuleFor(register => register.Name).NotEmpty().WithMessage("Device name cannot be empty");
    //        RuleFor(register => register.Gender).NotEmpty().WithMessage("Device Serial Number cannot be empty");
    //    }
    //}
}
