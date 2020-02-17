export class DeviceDetail {
    // Note: Using only optional constructor properties without backing store disables typescript's type checking for the type
    constructor(
      id?: string, 
      deviceId?: string, 
      temperaturC?: string, 
      airHumidity?: string, 
      carbonMonoxide?: string, 
      healthStatus?: string, 
      queueItemString?: string, 
      isStored?: string, 
      timeStamp?: string
      ) {
  
      this.id = id;
      this.deviceId = deviceId;
      this.temperaturC = temperaturC;
      this.airHumidity = airHumidity;
      this.carbonMonoxide = carbonMonoxide;
      this.healthStatus = healthStatus;
      this.queueItemString = queueItemString;
      this.isStored = isStored;
      this.timeStamp = timeStamp;
    }
  
    public id: string;
    public deviceId: string;
    public temperaturC: string;
    public airHumidity: string;
    public carbonMonoxide: string;
    public healthStatus: string;
    public queueItemString: string;
    public isStored: string;
    public timeStamp: string;
 
  }
  
  