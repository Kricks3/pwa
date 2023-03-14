import React, { useEffect, useRef, useState } from "react";
import { Webcam } from "../webcam";
import "./Camera.css";
import axios from "axios";

function Camera({isOffline} : {isOffline: boolean}): JSX.Element {

  const webcamRef = useRef<any>(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  let webcam: any;

  useEffect(() => {
    const canvasElement = document.createElement('canvas');
    webcam = new Webcam(
        document.getElementById('webcam'),
        canvasElement
    );
    webcam.setup().catch(() => {
        alert("Error getting access to your camera"); 
    }) 
  }, [])

  const findLocalItems = (query: RegExp) => {
    let i,
      results = [];
    for (i in localStorage) {
      if (localStorage.hasOwnProperty(i)) {
        if (i.match(query) || (!query && typeof i === "string")) {
          const value = localStorage.getItem(i);
          results.push({ key: i, val: value });
        }
      }
    }
    return results;
  };

  const discardImage = () => {
    setIsCaptured(false)
    setCapturedImage(null)
  };

  const captureImage = async () => {
    const capturedData = webcam?.takeBase64Photo({
      type: "jpeg",
      quality: 0.8
    });
    console.log(capturedData);
    setIsCaptured(true)
    setCapturedImage(capturedData.base64)
  };

  const uploadImage = () => {
    if (isOffline) {
      console.log("you're using in offline mode sha");
      // create a random string with a prefix
      const prefix = "cloudy_pwa_";
      // create random string
      const rs = Math.random()
        .toString(36)
        .substr(2, 5);
      localStorage.setItem(`${prefix}${rs}`, capturedImage || '');
      alert(
        "Image saved locally, it will be uploaded to my account once internet connection is detected"
      );
      discardImage();

      // save image to local storage
    } else {
      setIsUploading(true)
      axios
        .post(`https://api.cloudinary.com/v1_1/dm6f2ozxi/image/upload`, {
          file: capturedImage,
          upload_preset: "n2ldfmvv"
        })
        .then(data => {
          setIsUploading(false)
          if (data.status === 200) {
            console.log(data);
            alert("Image Uploaded !");
            discardImage();
          } else {
            alert("Sorry, we encountered an error uploading your image");
          }
        })
        .catch(error => {
          alert("Sorry, we encountered an error uploading your image");
          setIsUploading(false)
        });
    }
  };

  const checkUploadStatus = (data: any) => {
    setIsUploading(false);
    if (data.status === 200) {
      alert("Image Uploaded !");
      discardImage();
    } else {
      alert("Sorry, we encountered an error uploading your image");
    }
  };

  function batchUploads() {
    const images = findLocalItems(/^cloudy_pwa_/);
    let error = false;
    if (images.length > 0) {
        setIsUploading(true);
        for (let i = 0; i < images.length; i++) {
          // upload
          axios
            .post(`https://api.cloudinary.com/v1_1/dm6f2ozxi/image/upload`, {
              file: images[i].val,
              upload_preset: "n2ldfmvv"
            })
            .then(data => checkUploadStatus(data))
            .catch(error => {
              error = true;
            });
        }
        setIsUploading(false)
        if (!error) {
          alert("All saved images have been uploaded !");
        }
      }

  }

  useEffect(() => {
    batchUploads();
  }, [isOffline])

  const uploading = isUploading ? (
    <div>
      <p> Uploading Image, please wait ... </p>
    </div>
  ) : (
    <span />
  );

  const imageDisplay = capturedImage ? (
    <img
      src={capturedImage}
      alt="captured"
      width="200"
      height="200"
    />
  ) : (
    <span />
  );

  const buttons = isCaptured ? (
    <div>
      <button className="deleteButton" onClick={discardImage}>
        {" "}
        Delete Photo{" "}
      </button>
      <button className="captureButton" onClick={uploadImage}>
        {" "}
        Upload Photo{" "}
      </button>
    </div>
  ) : (
    <button className="captureButton" onClick={captureImage}>
      {" "}
      Take Picture{" "}
    </button>
  );

  

    return (
      <div>
        {uploading}
        <video
          autoPlay
          playsInline
          muted
          id="webcam"
          width="100"
          height="100"
          className="streamvideo"
        />
        <br />
        {isCaptured ? (
          <div className="imageCanvas">{imageDisplay}</div>
        ) : (
          <br />
        )}
        {buttons}
      </div>
    );

}
export default Camera;
