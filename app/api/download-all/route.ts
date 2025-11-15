import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import archiver from "archiver";
import { PassThrough } from "stream";
import axios from "axios";
import { auth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the projectSlug from query params
    const { searchParams } = new URL(request.url);
    const projectSlug = searchParams.get("projectSlug");

    if (!projectSlug) {
      return NextResponse.json({ error: "Project slug is required" }, { status: 400 });
    }

    // Initialize Supabase client with proper auth context
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Fetch all submissions for the project
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

    // Create a PassThrough stream
    const passThrough = new PassThrough();

    // Create an archive
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    // Pipe the archive to the PassThrough stream
    archive.pipe(passThrough);

    // Process each submission and add files to archive
    const downloadPromises = submissions.flatMap((submission) => {
      if (!submission.files || !Array.isArray(submission.files) || submission.files.length === 0) {
        return [];
      }

      return submission.files.map(async (file: any, fileIndex: number) => {
        try {
          const fileUrl = file.url || file.ufsUrl;
          if (!fileUrl) return;

          // Extract the original filename
          let origFilename = file.name || fileUrl.split("/").pop() || `file-${fileIndex}.dat`;

          // Download the file
          const response = await axios({
            method: "get",
            url: fileUrl,
            responseType: "arraybuffer",
          });

          // Add to archive
          const fileBuffer = Buffer.from(response.data);
          const submissionFolder = `${submission.name.replace(/[\/\\?%*:|"<>]/g, "_")}`;
          archive.append(fileBuffer, { name: `${submissionFolder}/${origFilename}` });

          return origFilename;
        } catch (err) {
          console.error(`Error downloading file from submission ${submission.id}:`, err);
          return null;
        }
      });
    });

    // Wait for all downloads
    await Promise.all(downloadPromises.filter(Boolean));

    // Finalize the archive
    await archive.finalize();

    // Set filename
    const filename = `${projectSlug}-submissions-${new Date().toISOString().split("T")[0]}.zip`;

    // Convert PassThrough to ReadableStream
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
