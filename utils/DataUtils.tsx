import Storage from '../manage/Storage';

export async function getDressData() {
  const items: any[] = []
  try {
    const keys = await Storage.getAllKeys();
    const matchedKey = Storage.matchKey(keys, "@DRESS_*");
    const dressData = await Storage.getMultiple(matchedKey);
    dressData?.forEach(element => {
      if (element[1]) {
        items.push(JSON.parse(element[1]));
      }
    });
  } catch (e) {
    console.log("DressSceen.getDressData", e);
  }
  return items;
};

export async function getAllDataAndKeys() {
  const keys = await Storage.getAllKeys();
  const data = await Storage.getMultiple(keys);
  return data;
};

export async function clearAllData() {
  try {
    const keys = await Storage.getAllKeys();
    keys?.forEach(element => {
      Storage.removeMyObject(element);
    });
    Storage.updateDressData();
  } catch (e) {
    console.log("clearDressData", e);
  }
}

export async function clearDressData() {
  try {
    const keys = await Storage.getAllKeys();
    const matchedKey = Storage.matchKey(keys, "@DRESS_*");
    matchedKey?.forEach(element => {
      Storage.removeMyObject(element);
    });
    Storage.updateDressData();
  } catch (e) {
    console.log("clearDressData", e);
  }
}

export async function clearOutfitData() {
  try {
    const keys = await Storage.getAllKeys();
    const matchedKey = Storage.matchKey(keys, "@OUTFIT_*");
    matchedKey?.forEach(element => {
      Storage.removeMyObject(element);
    });
    Storage.updateOutfitData();
  } catch (e) {
    console.log("clearOutfitData", e);
  }
}