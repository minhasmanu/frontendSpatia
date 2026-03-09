import { useEffect, useState } from "react";
import axios from "axios";
import "./history.css";

export default function History() {

  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get("http://10.103.111.25:8081/history")
      .then(res => setHistory(res.data))
      .catch(err => console.error(err));
  }, []);

  const deleteItem = async (image) => {

    try {

      await axios.delete(`http://10.103.111.25:8081/delete/${image}`);

      setHistory(history.filter(item => item.image !== image));

    } catch (error) {

      console.error("Delete failed:", error);

    }

  };

  if (selected) {
    return (
      <div className="viewerContainer">

        <button className="backBtn" onClick={() => setSelected(null)}>
          Back
        </button>

        <div className="viewerGrid">

          <img
            className="floorplanFull"
            src={`http://10.103.111.25:8081/uploads/${selected.image}`}
          />

          <model-viewer
            src={`http://10.103.111.25:8081/outputs/${selected.model}`}
            camera-controls
            auto-rotate
            className="modelViewer"
          ></model-viewer>

        </div>

      </div>
    );
  }

  return (
    <div className="historyPage">

      <h1 className="historyTitle">History</h1>

      <div className="historyGrid">

        {history.map((item, index) => (

          <div className="historyCard" key={index}>

            <img
              src={`http://10.103.111.25:8081/uploads/${item.image}`}
              className="historyThumbnail"
            />

            <div className="historyActions">

              <button
                className="viewBtn"
                onClick={() => setSelected(item)}
              >
                View
              </button>

              <button
                className="deleteBtn"
                onClick={() => deleteItem(item.image)}
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}