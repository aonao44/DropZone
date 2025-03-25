import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 仮のデータ型定義
interface Submission {
  id: string;
  name: string;
  email?: string;
  submittedAt: Date;
  images: {
    id: string;
    url: string;
    filename: string;
  }[];
  figmaLinks: string[];
}

// 仮のデータ
const mockSubmission: Submission | null = {
  id: "sub_123456",
  name: "山田 太郎",
  email: "yamada@example.com",
  submittedAt: new Date("2025-03-25T15:15:00"),
  images: [
    {
      id: "img_1",
      url: "/placeholder.svg?height=300&width=400",
      filename: "ロゴデザイン_最終版.png",
    },
    {
      id: "img_2",
      url: "/placeholder.svg?height=300&width=400",
      filename: "バナー_ヘッダー.jpg",
    },
  ],
  figmaLinks: ["https://figma.com/file/example1", "https://figma.com/file/example2"],
};

// 日付をフォーマットする関数
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

export default function SubmissionViewPage({ params }: { params: { slug: string } }) {
  // 実際の実装では、ここでparams.slugを使用して特定のプロジェクトの提出内容を取得します
  const submission = mockSubmission;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200 hover:bg-gray-800" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">提出内容の確認</h1>
          <p className="text-gray-400">プロジェクト: {params.slug}</p>
        </div>

        {submission ? (
          <div className="space-y-6">
            {/* 提出者情報 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-white flex items-center">
                  <span className="bg-purple-600/20 text-purple-400 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  提出者情報
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">名前</p>
                    <p className="text-white">{submission.name}</p>
                  </div>
                  {submission.email && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">メールアドレス</p>
                      <p className="text-white">{submission.email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-400 mb-1">提出日時</p>
                    <p className="text-white">{formatDate(submission.submittedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 提出物（画像・Figmaリンク） */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-white flex items-center">
                  <span className="bg-purple-600/20 text-purple-400 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </span>
                  提出物
                </CardTitle>
              </CardHeader>
              <CardContent>
                {submission.images.length > 0 && (
                  <>
                    <h3 className="text-lg font-medium mb-4 text-white">アップロードされた画像</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {submission.images.map((image) => (
                        <div key={image.id} className="bg-gray-750 rounded-lg p-4">
                          <div className="relative aspect-video bg-gray-900 overflow-hidden rounded-md mb-3">
                            <Image
                              src={image.url || "/placeholder.svg"}
                              alt={image.filename}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-300 truncate mr-2">{image.filename}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              ダウンロード
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {submission.figmaLinks.length > 0 && (
                  <>
                    <h3 className="text-lg font-medium mb-4 text-white">Figmaリンク</h3>
                    <div className="space-y-3">
                      {submission.figmaLinks.map((link, index) => (
                        <div key={index} className="bg-gray-750 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-300 truncate mr-2">{link}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
                              asChild
                            >
                              <a href={link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                開く
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="bg-gray-700/50 p-4 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2 text-white">まだ提出はありません</h3>
              <p className="text-gray-400 text-center max-w-md">
                このプロジェクトにはまだ素材の提出がありません。提出があると、ここに表示されます。
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
