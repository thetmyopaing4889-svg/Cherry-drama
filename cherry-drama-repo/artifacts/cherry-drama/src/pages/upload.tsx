import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, FileVideo, Sparkles } from "lucide-react";
import { useCreateJob } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [movieTitle, setMovieTitle] = useState("");
  const [language, setLanguage] = useState<"myanmar" | "japanese">("myanmar");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const createJob = useCreateJob();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('video/')) {
        setFile(droppedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a video file.",
          variant: "destructive"
        });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!movieTitle) {
      toast({
        title: "Missing title",
        description: "Please enter a movie or drama title.",
        variant: "destructive"
      });
      return;
    }
    
    if (!file) {
      toast({
        title: "Missing video",
        description: "Please select a video file to recap.",
        variant: "destructive"
      });
      return;
    }

    createJob.mutate({
      data: {
        movieTitle,
        language,
        videoFilename: file.name
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Job created",
          description: "Your recap is now processing.",
        });
        setLocation("/processing");
      },
      onError: () => {
        toast({
          title: "Error creating job",
          description: "An unknown error occurred.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto w-full p-8 pt-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 font-serif tracking-wide">Create New Recap</h1>
          <p className="text-muted-foreground">Upload your source video and let our AI generate a complete dramatic recap.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Source Video</CardTitle>
                  <CardDescription>Upload the episode or movie file</CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${isDragging ? 'border-primary bg-primary/10' : file ? 'border-primary/50 bg-card/80' : 'border-border hover:border-primary/50 hover:bg-card/80'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="video/*" 
                      className="hidden" 
                    />
                    
                    {file ? (
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                          <FileVideo className="h-8 w-8 text-primary" />
                        </div>
                        <div className="text-white font-medium">{file.name}</div>
                        <div className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                          <UploadCloud className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-base font-medium text-white">Click or drag video here</p>
                          <p className="text-sm text-muted-foreground mt-1">MP4, MKV, AVI up to 5GB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Recap Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-base">Movie or Drama Title</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. Crash Landing on You, Shogun..." 
                      value={movieTitle}
                      onChange={(e) => setMovieTitle(e.target.value)}
                      className="bg-background/50 h-12 text-lg"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">Output Language</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setLanguage("myanmar")}
                        className={`flex items-center justify-center space-x-3 p-4 rounded-lg border-2 transition-all ${language === "myanmar" ? "border-primary bg-primary/10 text-white" : "border-border bg-background/50 text-muted-foreground hover:border-primary/30"}`}
                      >
                        <div className="h-6 w-8 rounded overflow-hidden relative border border-white/20">
                          <div className="absolute inset-0 bg-yellow-400 h-1/3"></div>
                          <div className="absolute top-1/3 inset-x-0 bg-green-500 h-1/3"></div>
                          <div className="absolute bottom-0 inset-x-0 bg-red-500 h-1/3"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-3 w-3 bg-white rotate-45 transform scale-x-110 star-shape"></div>
                          </div>
                        </div>
                        <span className="font-semibold">Myanmar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage("japanese")}
                        className={`flex items-center justify-center space-x-3 p-4 rounded-lg border-2 transition-all ${language === "japanese" ? "border-primary bg-primary/10 text-white" : "border-border bg-background/50 text-muted-foreground hover:border-primary/30"}`}
                      >
                        <div className="h-6 w-8 rounded overflow-hidden relative border border-white/20 bg-white">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-4 w-4 bg-red-600 rounded-full"></div>
                          </div>
                        </div>
                        <span className="font-semibold">Japanese</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg text-primary">
                    <Sparkles className="mr-2 h-5 w-5" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-background/50 p-4 border border-border">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Target Duration</div>
                    <div className="text-xl font-medium text-white">10 - 15 minutes</div>
                    <p className="text-xs text-muted-foreground mt-2">Optimal length for YouTube retention based on your channel history.</p>
                  </div>
                  <div className="rounded-lg bg-background/50 p-4 border border-border">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Voice Style</div>
                    <div className="text-base font-medium text-white">Dramatic Narrative</div>
                    <p className="text-xs text-muted-foreground mt-2">Azure TTS preset matching cinematic romantic thrillers.</p>
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-14 text-lg font-bold shadow-[0_0_20px_rgba(194,24,91,0.4)] hover:shadow-[0_0_30px_rgba(194,24,91,0.6)] transition-all"
                disabled={createJob.isPending}
              >
                {createJob.isPending ? "Starting..." : "Start Recap"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}