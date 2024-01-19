import React from "react";


interface IPdfSelectorProps {
  onSelect: (data: File[]) => void;
  allowMultiple?: boolean;
}


const PdfSelector: React.FC<IPdfSelectorProps> = ({ onSelect, allowMultiple }) => {

  const onChange = (fileList: FileList | null) => {   

    if (!fileList) {
      return;
    }

    var _fileData: File[] = [];

    for (var i = 0; i < fileList.length; i++) {
      var _file = fileList[i];
      _fileData.push(_file);
    }

    onSelect(_fileData);
  }

  return (
    <input 
      type="file" 
      accept="application/pdf" 
      onChange={event => onChange(event.target?.files)} 
      multiple={allowMultiple} 
      style={{ margin: "4px 4px 12px 4px" }}
    />
  )
}


export default PdfSelector;