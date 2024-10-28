import "./App.css";
import ImageOverlay from "./OverlayImage";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import data from "./frameData.json";
import Error404 from "./Error404";

function App() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [frameData, setFrameData] = useState(null);

  useEffect(() => {
    async function fetchFrame() {
      try {
        const frame = data.frames.find((frame) => frame.name === id);

        if (frame) {
          setFrameData(frame);
        }
      } catch (error) {
        console.error("Error fetching frame data: ", error);
      }
    }

    fetchFrame();
  }, [id]);

  if (!frameData) {
    return <Error404 />;
  }

  return (
    <div>
      <ImageOverlay data={frameData} />
    </div>
  );
}

export default App;
