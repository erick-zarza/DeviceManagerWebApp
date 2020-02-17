using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DAL;
using QuickApp.ViewModels;
using AutoMapper;
using Microsoft.Extensions.Logging;
using QuickApp.Helpers;

namespace QuickApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DeviceController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger _logger;
        private readonly IEmailSender _emailSender;

        public DeviceController(IMapper mapper, IUnitOfWork unitOfWork, ILogger<DeviceController> logger, IEmailSender emailSender)
        {
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _logger = logger;
            _emailSender = emailSender;
        }

        // GET: api/values
        [HttpGet]
        public IActionResult Get()
        {
            var allDevices = _unitOfWork.Devices.GetAllDevicesData();
            return Ok(_mapper.Map<IEnumerable<DeviceViewModel>>(allDevices));
        }
    }
}
