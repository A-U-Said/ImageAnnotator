

const isValidHex = (input: string) => {
  var reg=/^#([0-9a-f]{3}){1,2}$/g;
  return reg.test(input);
}

const isValidRgba = (input: string) => {
  var reg = /^^rgba[(](?:\s*0*(?:\d\d?(?:\.\d+)?(?:\s*%)?|\.\d+\s*%|100(?:\.0*)?\s*%|(?:1\d\d|2[0-4]\d|25[0-5])(?:\.\d+)?)\s*,){3}\s*0*(?:\.\d+|1(?:\.0*)?)\s*[)]$/g;
  return reg.test(input);
}

const isValidRgb = (input: string) => {
  var reg = /^rgb[(](?:\s*0*(?:\d\d?(?:\.\d+)?(?:\s*%)?|\.\d+\s*%|100(?:\.0*)?\s*%|(?:1\d\d|2[0-4]\d|25[0-5])(?:\.\d+)?)\s*(?:,(?![)])|(?=[)]))){3}[)]$/g;
  return reg.test(input);
}

const hexToRGBA = (hexCode: string, opacity: number = 0.7) => {
  if (!isValidHex(hexCode)) {
    throw new Error("Invalid Hex code provided");
  }
  var hex = hexCode.replace('#', ''); 
  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }    
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  if (opacity > 1 && opacity <= 100) {
    opacity = opacity / 100;   
  }
  return `rgba(${r},${g},${b},${opacity})`;
};

const rgbToRgba = (input: string, opacity: number = 0.7) => {
  var rgba = input.replace(/rgb/i, "rgba");
  rgba = input.replace(/\)/i,`,${opacity})`);
  return rgba;
}

const ensureRgba = (input: string, opacity: number = 0.7) => {
  if (isValidRgba(input)) {
    return input;
  }
  else if (isValidRgb(input)) {
    return rgbToRgba(input, opacity);
  }
  else if (isValidHex(input)) {
    return hexToRGBA(input, opacity);
  }
}


const colorUtils = {
  isValidHex,
  isValidRgba,
  isValidRgb,
  hexToRGBA,
  rgbToRgba,
  ensureRgba
}

export default colorUtils;