/** New branding uses new keys while existing checkpoints remain readable. */
const wrappers=new WeakMap(),wrapped=new WeakSet();
const OLD_PREFIX='blacksite.';
export const LEGACY_BACKUP_FORMAT='blacksite-backup';
export function legacyStorageKey(key){return typeof key==='string'&&key.startsWith('nulldelve.')?OLD_PREFIX+key.slice('nulldelve.'.length):key;}
export function compatibleStorage(storage){
 if(!storage||typeof storage!=='object')return storage;
 if(wrapped.has(storage))return storage;
 if(wrappers.has(storage))return wrappers.get(storage);
 const legacy=legacyStorageKey;
 const result={getItem(key){const value=storage.getItem(key);if(value!==null&&value!==undefined)return value;const old=legacy(key);return old===key?value:storage.getItem(old);}};
 if(typeof storage.setItem==='function')result.setItem=(key,value)=>storage.setItem(key,value);
 if(typeof storage.removeItem==='function')result.removeItem=key=>{storage.removeItem(key);const old=legacy(key);if(old!==key)storage.removeItem(old);};
 wrappers.set(storage,result);wrapped.add(result);return result;
}
