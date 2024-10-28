import React, { useEffect, useState, useRef } from "react";
import { CameraOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button, Upload, message } from "antd";

const ImageOverlay = ({ data }) => {
  // const frameImage = "/frames/frame3.jpg";
  let frameImage = data?.link;

  const [overlayImage, setOverlayImage] = useState(null);
  const canvasRef = useRef(null);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "awareness_frame.png";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }
    }, "image/png");
  };

  const handleOverlayImageUpload = (info) => {
    const file = info.fileList[0].originFileObj;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOverlayImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOverlay = () => {
    if (!overlayImage || !frameImage) {
      message.error("Please upload both base and overlay images.");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const baseImg = new Image();
    const overlayImg = new Image();

    baseImg.crossOrigin = "anonymous";
    overlayImg.crossOrigin = "anonymous";

    baseImg.src = frameImage;
    overlayImg.src = overlayImage;

    baseImg.onload = () => {
      canvas.width = baseImg.width;
      canvas.height = baseImg.height;

      ctx.drawImage(baseImg, 0, 0);

      overlayImg.onload = () => {
        const overlayWidth = data.dimension.overlayWidth;
        const overlayHeight = data.dimension.overlayHeight;
        const xPosition = data.dimension.xPosition;
        const yPosition = data.dimension.yPosition;

        ctx.drawImage(
          overlayImg,
          xPosition,
          yPosition,
          overlayWidth,
          overlayHeight
        );
      };

      overlayImg.onerror = () => {
        message.error("Failed to load the overlay image.");
      };
    };

    baseImg.onerror = () => {
      message.error("Failed to load the base image.");
    };
  };

  useEffect(() => {
    if (overlayImage) {
      handleOverlay();
    }
  }, [overlayImage]);

  return (
    <div>
      <div className="header">
        <div>
          <h2>Awareness Frame</h2>
        </div>
        {overlayImage ? (
          <div>
            <canvas ref={canvasRef} className="canvas-frame"></canvas>
          </div>
        ) : (
          <div>
            <img src={frameImage} alt={data?.name} className="canvas-frame" />
          </div>
        )}
      </div>

      <div className="actions">
        <Upload
          maxCount={1}
          showUploadList={false}
          beforeUpload={() => false}
          onChange={handleOverlayImageUpload}
        >
          <Button
            icon={<CameraOutlined />}
            type="dashed"
            className="upload-btn"
          >
            Choose a Photo
          </Button>
        </Upload>

        {frameImage && overlayImage && (
          <Button
            icon={<DownloadOutlined />}
            onClick={downloadImage}
            className="download-btn"
          >
            Download Image
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageOverlay;
