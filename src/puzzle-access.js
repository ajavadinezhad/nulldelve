// Logical controls stay separate for puzzle state; each shared panel has one world console.
export function puzzleAccessVisible(device){
 const primary={glyph:'glyph-circle',power:'power-a',valve:'valve-a'}[device.kind];
 if(primary)return device.id===primary;
 return !['hospitalValveA','hospitalValveB','hospitalValveC','freightSwitchA','freightSwitchB','signalMotorA','signalMotorB','signalMotorC'].includes(device.task);
}

export function puzzleAccessPoint(device,devices){
 if(!device||puzzleAccessVisible(device))return device;
 const kind={glyph:'glyph-circle',power:'power-a',valve:'valve-a'}[device.kind];
 const task=device.task?.startsWith('hospitalValve')?'hospitalSterile':device.task?.startsWith('freightSwitch')?'freightDispatch':device.task?.startsWith('signalMotor')?'signalLoad':null;
 return devices.find(d=>kind?d.id===kind:d.task===task)??device;
}
