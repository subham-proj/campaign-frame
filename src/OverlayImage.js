import React, { useEffect, useState, useRef } from "react";
import { CameraOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button, Upload, message } from "antd";

const ImageOverlay = ({ data }) => {
  const frameImage = data?.link;
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
      reader.onloadend = () => setOverlayImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  };

  const drawBaseImage = async () => {
    if (!frameImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    try {
      const baseImg = await loadImage(frameImage);
      canvas.width = baseImg.width;
      canvas.height = baseImg.height;
      ctx.drawImage(baseImg, 0, 0);
    } catch {
      message.error("Failed to load the base image.");
    }
  };

  const drawOverlay = async () => {
    if (!overlayImage) {
      message.error("Please upload an overlay image.");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    try {
      const overlayImg = await loadImage(overlayImage);

      const { overlayWidth, overlayHeight, xPosition, yPosition } =
        data.dimension;
      ctx.drawImage(
        overlayImg,
        xPosition,
        yPosition,
        overlayWidth,
        overlayHeight
      );
    } catch {
      message.error("Failed to load the overlay image.");
    }
  };

  useEffect(() => {
    drawBaseImage();
  }, [frameImage]);

  useEffect(() => {
    if (overlayImage) {
      drawOverlay();
    }
  }, [overlayImage]);

  return (
    <div>
      <div className="header">
        <div>
          <h2>Awareness Frame</h2>
        </div>
        <div>
          <canvas ref={canvasRef} className="canvas-frame"></canvas>
        </div>
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
