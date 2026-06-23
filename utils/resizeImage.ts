export function resizeImage(
  file: File,
  targetW: number,
  targetH: number,
  mode: "fit" | "fill" | "stretch",
  bgColor = "#ffffff",
  format = "image/png",
  quality = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get 2D context"));
        return;
      }

      if (mode === "fit") {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, targetW, targetH);
        const scale = Math.min(targetW / img.width, targetH / img.height);
        const x = (targetW - img.width * scale) / 2;
        const y = (targetH - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      } else if (mode === "fill") {
        const scale = Math.max(targetW / img.width, targetH / img.height);
        const x = (targetW - img.width * scale) / 2;
        const y = (targetH - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      } else {
        ctx.drawImage(img, 0, 0, targetW, targetH);
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas conversion to blob failed"));
          }
        },
        format,
        quality
      );

      // Clean up object URL
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image file"));
    };

    img.src = URL.createObjectURL(file);
  });
}
