
const fileToDataUri: (file: File) => Promise<string> = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string)
    };
    reader.readAsDataURL(file);
  })
}

const files = {
  fileToDataUri
};

export default files;