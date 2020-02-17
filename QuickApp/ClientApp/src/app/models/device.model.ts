export class Device {
    // Note: Using only optional constructor properties without backing store disables typescript's type checking for the type
    constructor(id?: string, name?: string, serialNumber?: string, registrationDate?: string, firmwareVersion?: string) {
  
      this.id = id;
      this.name = name;
      this.serialNumber = serialNumber;
      this.registrationDate = registrationDate;
      this.firmwareVersion = firmwareVersion;
    }
  
    public id: string;
    public name: string;
    public serialNumber: string;
    public registrationDate: string;
    public firmwareVersion: string;
 
  }
  