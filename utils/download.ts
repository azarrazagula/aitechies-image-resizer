import JSZip from "jszip";

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function triggerBatchZipDownload(
  items: { blob: Blob; filename: string }[],
  zipFilename: string
): Promise<void> {
  const zip = new JSZip();
  items.forEach((item) => {
    zip.file(item.filename, item.blob);
  });

  const zipBlob = await zip.generateAsync({ type: "blob" });
  triggerDownload(zipBlob, zipFilename);
}
