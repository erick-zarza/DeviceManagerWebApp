using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DAL.Repositories;
using DAL.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using DAL.Repositories.Interfaces;

namespace DeviceManagerApp.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class QueueItemController : ControllerBase
    {
        private readonly IDocumentDBRepository<QueueItem> Repository;
        public QueueItemController(IDocumentDBRepository<QueueItem> Repository)
        {
            this.Repository = Repository;
        }

        [HttpGet]
        public async Task<ActionResult> Get()
        {
            var res = await Repository.GetItemsAsync();
            return Ok(res);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(string id)
        {
            //Doing it this way since I'm just getting familiar with CosmosDB SQL API syntax.
            var res = (await Repository.GetItemsAsync()).Where(x => x.DeviceId == id);

            return Ok(res);
        }
    }
}