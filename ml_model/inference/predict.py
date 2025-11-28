from ultralytics import YOLO
import cv2
import os
import argparse

model = YOLO("../models/best.pt")  # path to trained model


def predict_image(image_path, save=False):
    results = model(image_path)

    for r in results:
        annotated = r.plot()
        cv2.imshow("Detection Output", annotated)
        cv2.waitKey(0)

        if save:
            out_path = "prediction_output.jpg"
            cv2.imwrite(out_path, annotated)
            print(f"Saved result at: {out_path}")


def predict_video(video_path, save=False):
    cap = cv2.VideoCapture(video_path)

    if save:
        out_path = "prediction_video_output.mp4"
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(out_path, fourcc, 30, 
                              (int(cap.get(3)), int(cap.get(4))))

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame)
        annotated = results[0].plot()
        cv2.imshow("Video Detection", annotated)

        if save:
            out.write(annotated)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()

    if save:
        out.release()
        print(f"Saved video output: {out_path}")


def predict_webcam():
    cap = cv2.VideoCapture(0)

    while True:
        ret, frame = cap.read()
        results = model(frame)
        annotated = results[0].plot()
        cv2.imshow("Webcam Detection", annotated)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument("--image", type=str, help="Path to image")
    parser.add_argument("--video", type=str, help="Path to video")
    parser.add_argument("--webcam", action="store_true")
    parser.add_argument("--save", action="store_true")

    args = parser.parse_args()

    if args.image:
        predict_image(args.image, args.save)

    elif args.video:
        predict_video(args.video, args.save)

    elif args.webcam:
        predict_webcam()

    else:
        print("No input provided. Use --image path OR --video path OR --webcam")
