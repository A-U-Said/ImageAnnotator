import React, { useEffect, useState } from 'react';


interface IPdfViewerProps {
  title?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  className?: string;
  data?: string;
  innerRef?: React.Ref<HTMLIFrameElement>;
  showToolbar?: boolean;
}

interface pdfObject {
  url: string | null;
  error: string | null;
  loading: boolean;
}


export const PdfViewer: React.FC<IPdfViewerProps> = ({
  title,
  width,
  height,
  style,
  className,
  data,
  innerRef,
  showToolbar = true
}) => {

  const [pdf, setPdf] = useState<pdfObject>({
    url: null,
    error: null,
    loading: !!document,
  });

  useEffect(() => {
    if (data) {
      fetch(data)
        .then(res => res.blob()
          .then(x => 
            setPdf({
              url: URL.createObjectURL(x),
              loading: false,
              error: null,
            })
          )
        );
    }
  }, [data]);

  const src = pdf.url
    ? `${pdf.url}#toolbar=${showToolbar ? 1 : 0}`
    : undefined;

  return (
    <iframe
      src={src}
      title={title}
      width={width}
      height={height}
      style={style}
      className={className}
      ref={innerRef}
    />
  );
};

export default PdfViewer;