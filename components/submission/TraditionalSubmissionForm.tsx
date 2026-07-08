"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, User, Mail, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileUploader } from '@/components/file-uploader';
import { useUploadThing } from '@/lib/uploadthing';
import { generateRandomSlug } from '@/lib/utils';

type ProjectInfo = {
  title: string;
  requesterName: string;
  requesterEmail: string;
  createdAt: string;
};

interface TraditionalSubmissionFormProps {
  projectSlug: string;
  projectInfo?: ProjectInfo;
  previousSubmitter?: { name: string; email: string } | null;
}

/**
 * 従来モード（slots.length === 0の場合）
 * シンプルなファイルアップロードUI
 */
export function TraditionalSubmissionForm({
  projectSlug,
  projectInfo,
  previousSubmitter,
}: TraditionalSubmissionFormProps) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [figmaUrl, setFigmaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmittingRef = useRef(false);
  const SUBMITTER_INFO_KEY = 'dropzone_submitter_info';

  const { startUpload } = useUploadThing("imageUploader");

  // LocalStorageから提出者情報を復元
  useEffect(() => {
    try {
      const savedInfo = localStorage.getItem(SUBMITTER_INFO_KEY);
      if (savedInfo) {
        const { name: savedName, email: savedEmail } = JSON.parse(savedInfo);
        if (savedName) setName(savedName);
        if (savedEmail) setEmail(savedEmail);
      } else if (previousSubmitter) {
        if (previousSubmitter.name) setName(previousSubmitter.name);
        if (previousSubmitter.email) setEmail(previousSubmitter.email);
      }
    } catch (error) {
      console.error('Error loading submitter information:', error);
      if (previousSubmitter) {
        if (previousSubmitter.name) setName(previousSubmitter.name);
        if (previousSubmitter.email) setEmail(previousSubmitter.email);
      }
    }
  }, [previousSubmitter]);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      setSubmitError("名前とメールアドレスを入力してください");
      return;
    }

    if (files.length === 0 && !figmaUrl.trim()) {
      setSubmitError("少なくとも1つのファイルまたはFigma URLを追加してください");
      return;
    }

    setSubmitError(null);

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      let uploadedFiles: any[] = [];

      if (files.length > 0) {
        const uploadResults = await startUpload(files);
        if (!uploadResults) {
          throw new Error("ファイルのアップロードに失敗しました");
        }
        uploadedFiles = uploadResults;
      }

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          slug: generateRandomSlug(),
          projectSlug,
          submittedAt: new Date().toISOString(),
          files: uploadedFiles.map((file: any) => ({
            name: file.name,
            url: file.url,
          })),
          figmaLinks: figmaUrl ? [figmaUrl] : [],
        }),
      });

      if (response.ok) {
        try {
          localStorage.setItem(SUBMITTER_INFO_KEY, JSON.stringify({ name, email }));
        } catch (error) {
          console.error('Error saving submitter information:', error);
        }

        setIsSubmitted(true);
      } else {
        throw new Error("提出に失敗しました");
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError('提出中にエラーが発生しました');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-4 py-12"
      >
        <Card className="bg-slate-800/40 border-slate-600/50">
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" aria-hidden="true" />
            <h2 className="text-2xl font-light text-slate-50 mb-4">提出が完了しました</h2>
            <p className="text-slate-400 mb-8">
              ファイルのアップロードが完了しました。ご協力ありがとうございます。
            </p>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="gap-2 h-11"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              トップページへ
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {projectInfo && (
        <Card className="mb-6 bg-slate-800/40 border-slate-600/50">
          <CardHeader>
            <CardTitle className="text-xl font-light text-slate-50">
              {projectInfo.title}
            </CardTitle>
            <p className="text-sm text-slate-400">
              依頼者: {projectInfo.requesterName}
            </p>
          </CardHeader>
        </Card>
      )}

      <Card className="mb-6 bg-slate-800/40 border-slate-600/50">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-50">提出者情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div>
              <Label htmlFor="name" className="text-slate-300">
                <User className="inline h-4 w-4 mr-1" aria-hidden="true" />
                お名前
              </Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田太郎"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-slate-300">
                <Mail className="inline h-4 w-4 mr-1" aria-hidden="true" />
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@example.com"
                className="mt-1"
              />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-6 bg-slate-800/40 border-slate-600/50">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-50">ファイルアップロード</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploader
            id="traditional-files"
            files={files}
            onFilesChange={setFiles}
            maxFiles={10}
            multiple={true}
          />
        </CardContent>
      </Card>

      <Card className="mb-6 bg-slate-800/40 border-slate-600/50">
        <CardHeader>
          <CardTitle className="text-lg font-light text-slate-50">Figma URL（任意）</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={figmaUrl}
            onChange={(e) => setFigmaUrl(e.target.value)}
            placeholder="https://www.figma.com/..."
          />
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-3">
        {submitError && (
          <p
            role="alert"
            className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-center max-w-md"
          >
            {submitError}
          </p>
        )}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          className="px-12 h-11"
        >
          {isSubmitting ? '提出中…' : '提出する'}
        </Button>
      </div>
    </div>
  );
}
