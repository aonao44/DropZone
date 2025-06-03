import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 10 } }) // 16MB → 8MBに変更
    .middleware(async () => {
      return { userId: "dropzone-user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete");
      return { fileUrl: file.url, ufsUrl: file.url, fileName: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
