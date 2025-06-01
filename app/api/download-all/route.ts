import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import archiver from "archiver";
import { Readable, PassThrough } from "stream";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    // Get the projectSlug from query params
    const { searchParams } = new URL(request.url);
    const projectSlug = searchParams.get("projectSlug");

    if (!projectSlug) {
      return NextResponse.json({ error: "Project slug is required" }, { status: 400 });
    }

    // Initialize Supabase client (public, no auth)
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch all submissions for the project directly
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("id, name, files")
      .eq("project_slug", projectSlug);

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
      return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
    }

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({ error: "No submissions found for this project" }, { status: 404 });
    }

    // Create a PassThrough stream to pipe the archive to
    const passThrough = new PassThrough();

    // Create an archive
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Compression level
    });

    // Pipe the archive to the PassThrough stream
    archive.pipe(passThrough);

    // Keep track of unique filenames to avoid collisions
    const usedFilenames = new Set();

    // Process each submission and add its files to the archive
    const downloadPromises = submissions.flatMap((submission) => {
      if (!submission.files || !Array.isArray(submission.files) || submission.files.length === 0) {
        return [];
      }

      return submission.files.map(async (file, fileIndex) => {
        try {
          const fileUrl = file.url || file.ufsUrl;
          if (!fileUrl) return;

          // Extract the original filename from the URL
          let origFilename = file.name || fileUrl.split("/").pop() || `file-${fileIndex}.dat`;

          // Create a unique filename including the submission ID to avoid collisions
          let filename = `${submission.id}-${origFilename}`;

          // If we already have this filename, add a counter
          if (usedFilenames.has(filename)) {
            let counter = 1;
            const baseName = filename.substring(0, filename.lastIndexOf(".")) || filename;
            const extension = filename.substring(filename.lastIndexOf(".")) || "";

            while (usedFilenames.has(`${baseName}-${counter}${extension}`)) {
              counter++;
            }

            filename = `${baseName}-${counter}${extension}`;
          }

          usedFilenames.add(filename);

          // Download the file
          const response = await axios({
            method: "get",
            url: fileUrl,
            responseType: "arraybuffer",
          });

          // Add the downloaded file to the archive
          const fileBuffer = Buffer.from(response.data);

          // Create folder structure by submission name
          const submissionFolder = `${submission.name.replace(/[\/\\?%*:|"<>]/g, "_")}`;
          archive.append(fileBuffer, { name: `${submissionFolder}/${origFilename}` });

          return filename;
        } catch (err) {
          console.error(`Error downloading file from submission ${submission.id}:`, err);
          return null;
        }
      });
    });

    // Wait for all downloads to complete
    await Promise.all(downloadPromises.filter(Boolean));

    // Finalize the archive
    await archive.finalize();

    // Set the appropriate headers for the response
    const filename = `${projectSlug}-submissions-${new Date().toISOString().split("T")[0]}.zip`;

    // Convert PassThrough to ReadableStream for Next.js 15
    const readableStream = new ReadableStream({
      start(controller) {
        passThrough.on('data', (chunk) => {
          controller.enqueue(chunk);
        });
        passThrough.on('end', () => {
          controller.close();
        });
        passThrough.on('error', (err) => {
          controller.error(err);
        });
      }
    });

    return new NextResponse(readableStream, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/zip",
      },
    });
  } catch (error) {
    console.error("Error in download-all route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
