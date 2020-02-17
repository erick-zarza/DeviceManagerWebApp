using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.Models
{
    public class QueueItem
    {
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        [JsonProperty(PropertyName = "deviceId")]
        public string DeviceId { get; set; }

        [JsonProperty(PropertyName = "temperaturC")]
        public string TemperaturC { get; set; }

        [JsonProperty(PropertyName = "airHumidity")]
        public string AirHumidity { get; set; }

        [JsonProperty(PropertyName = "carbonMonoxide")]
        public string CarbonMonoxide { get; set; }

        [JsonProperty(PropertyName = "healthStatus")]
        public string HealthStatus { get; set; }

        [JsonProperty(PropertyName = "queueItem")]
        public string QueueItemString { get; set; }

        [JsonProperty(PropertyName = "isStored")]
        public bool IsStored { get; set; }

        [JsonProperty(PropertyName = "_ts")]
        public long TimeStamp { get; set; }

    }
}

