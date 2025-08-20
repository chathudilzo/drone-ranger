"use client";
import Image from "next/image";
import "@tensorflow/tfjs";
import React, { useEffect, useRef } from "react";
import * as deeplab from "@tensorflow-models/deeplab";
import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [results, setResults] = useState<{ [key: string]: number }>({});
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const animalClasses = [
    "dog",
    "cat",
    "horse",
    "cow",
    "sheep",
    "bird",
    "person",
    "elephant",
    "bear",
    "zebra",
    "giraffe",
    "deer",
    "monkey",
    "kangaroo",
    "panda",
    "tiger",
    "lion",
    "leopard",
    "fox",
    "wolf",
    "rabbit",
    "pig",
    "goat",
    "chicken",
    "duck",
    "goose",
    "turkey",
    "camel",
    "buffalo",
    "donkey",
    "squirrel",
    "mouse",
    "rat",
    "bat",
    "penguin",
    "seal",
    "whale",
    "dolphin",
    "shark",
    "fish",
    "crocodile",
    "turtle",
    "frog",
    "snake",
  ];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
      setResults({});
    }
  };

  useEffect(() => {
    const loadModel = async () => {
      setLoading(true);
      const m = await deeplab.load({ base: "pascal", quantizationBytes: 2 });
      setModel(m);
      setLoading(false);
    };

    loadModel();
  }, []);

  const runSegmentation = async () => {
    setLoading(true);
    if (!model || !image) {
      setLoading(false);
      return;
    }

    const imgElement = document.getElementById("input-image");
    const { legend, segmentationMap } = await model.segment(imgElement);
    console.log("Legend:", legend);
    console.log("Segmentation map:", segmentationMap);
    const counts: { [key: string]: number } = {};
    animalClasses.forEach((cls) => (counts[cls] = 0));
    for (let i = 0; i < segmentationMap.length; i += 4) {
      const r = segmentationMap[i];
      const g = segmentationMap[i + 1];
      const b = segmentationMap[i + 2];

      for (const [label, color] of Object.entries(legend) as [
        string,
        number[]
      ][]) {
        const [lr, lg, lb] = color;
        if (r === lr && g === lg && b === lb) {
          counts[label] += 1;
        }
      }
    }
    console.log("Legend entries:", Object.entries(legend));
    console.log(
      "First 20 values of segmentationMap:",
      segmentationMap.slice(0, 20)
    );

    setResults(counts);
    if (canvasRef.current && imgRef.current && model) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = imgRef.current;
      const width = img.width;
      const height = img.height * 3;

      canvas.width = width / 2;
      canvas.height = height / 4;

      ctx.drawImage(img, 0, 0, width, height);

      const { legend, segmentationMap } = await model.segment(img);

      const overlay = ctx.createImageData(width, height);
      const segWidth = segmentationMap.width || segmentationMap.length ** 0.5;
      const segHeight = segmentationMap.height || segmentationMap.length ** 0.5;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const segX = Math.floor((x * segWidth) / width);
          const segY = Math.floor((y * segHeight) / height);
          const idx = (segY * segWidth + segX) * 4;

          const r = segmentationMap[idx];
          const g = segmentationMap[idx + 1];
          const b = segmentationMap[idx + 2];

          for (const [label, color] of Object.entries(legend)) {
            const [lr, lg, lb] = color as [number, number, number];
            if (r === lr && g === lg && b === lb) {
              const j = (y * width + x) * 4;
              overlay.data[j] = lr;
              overlay.data[j + 1] = lg;
              overlay.data[j + 2] = lb;
              overlay.data[j + 3] = 150;
              break;
            }
          }
        }
      }

      ctx.putImageData(overlay, 0, 0);
    }

    console.log("Pixel counts:", counts);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center  w-full px-32 py-6">
      <div className="grid grid-cols-2 gap-4 justify-between items-center p-12">
        <div>
          <h1 className="text-white text-5xl font-bold  mt-10 text-start">
            Drone Ranger
          </h1>
          <p className="text-gray-500 mt-5">
            An ML solution to Detect wild animals in drone shots, Detect & count
            wild animals using (PASCAL VOC) datasets
          </p>
          <button className="px-3 py-2 bg-blue-600 rounded-3xl mt-5">
            Scan Now
          </button>
        </div>
        <div>
          <Image src={"/logo.png"} alt="" width={800} height={800} />
        </div>
      </div>

      {!loading ? (
        <input
          placeholder="Upload Image"
          className="mt-8 border border-amber-300 rounded-3xl px-3 py-2"
          type="file"
          accept="image/*"
          onChange={handleUpload}
        />
      ) : (
        <p>Loading...</p>
      )}
      {image && (
        <div className="mt-5">
          <div className="flex flex-col justify-center items-center">
            <img
              src={image}
              id="input-image"
              ref={imgRef}
              className="block object-contain rounded-lg bg-gray "
              alt="Uploaded Image"
              onLoad={() => {
                if (canvasRef.current && imgRef.current) {
                  const imgWidth = imgRef.current.naturalWidth;
                  const imgHeight = imgRef.current.naturalHeight;
                }
              }}
            />
            <div className="flex flex-row justify-center items-center gap-5 mt-5">
              <canvas ref={canvasRef} className="  " />
              <div>
                <h4 className="text-white text-2xl font-bold text-center mt-10">
                  Animals Detected
                </h4>
                {Object.entries(results).map(
                  ([animal, count]) =>
                    count > 0 && (
                      <p className="text-gray-300 text-2xl mt-5" key={animal}>
                        {animal}: Detected
                      </p>
                    )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {!loading ? (
        <button
          onClick={runSegmentation}
          className="mt-8 border border-amber-300 rounded-3xl px-3 py-2 mx-auto hover:scale-110 transition"
        >
          Detect Animals
        </button>
      ) : (
        <p>Loading...</p>
      )}

      <div className="px-32 mt-10">
        <h3 className="text-white text-2xl font-bold text-center mt-10">
          What is Semantic segmentation
        </h3>
        <div className="grid grid-cols-2 gap-4 justify-between items-center mt-10">
          <p>
            Semantic segmentation is a computer vision technique where every
            pixel in an image is classified into a category, so instead of just
            saying “there is a cat in this image,” the model colors each pixel
            to show exactly where the cat is. For example, in a street photo,
            semantic segmentation can label pixels as “road,” “car,”
            “pedestrian,” or “building,” giving a detailed understanding of the
            whole scene. It’s like turning an image into a coloring book where
            each color represents a different object or region type.
          </p>
          <Image src={"/image.png"} alt="" width={800} height={800} />
        </div>
      </div>
    </div>
  );
}
