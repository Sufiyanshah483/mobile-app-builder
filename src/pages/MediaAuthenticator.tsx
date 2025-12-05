import { useState, useRef, useCallback } from "react";
import { ArrowLeft, Upload, Image, Loader2, X, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MediaAuthenticatorResult from "@/components/MediaAuthenticatorResult";
import { cn } from "@/lib/utils";

const MediaAuthenticator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleFileSelect = useCallback((file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, WebP, or GIF image.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setResult(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeMedia = async () => {
    if (!selectedFile || !imagePreview) return;

    setIsLoading(true);
    setResult(null);

    try {
      // Extract base64 data (remove data URL prefix)
      const base64Data = imagePreview.split(",")[1];

      const { data, error } = await supabase.functions.invoke("analyze-media", {
        body: {
          imageBase64: base64Data,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Unable to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-accent/10">
              <Camera className="w-5 h-5 text-accent" />
            </div>
            <h1 className="font-display font-semibold text-lg">
              Media Authenticator
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Upload Area */}
        {!result && (
          <Card>
            <CardContent className="p-6">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer",
                  isDragging 
                    ? "border-primary bg-primary/5" 
                    : selectedFile 
                      ? "border-border bg-muted/30" 
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleInputChange}
                  className="hidden"
                />

                {selectedFile && imagePreview ? (
                  <div className="space-y-4">
                    <div className="relative mx-auto w-fit">
                      <img
                        src={imagePreview}
                        alt="Selected media"
                        className="max-h-64 rounded-lg border border-border"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSelection();
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground">
                        Drop your image here
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or click to browse
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Image className="w-4 h-4" />
                      <span>JPEG, PNG, WebP, GIF • Max 10MB</span>
                    </div>
                  </div>
                )}
              </div>

              {selectedFile && (
                <Button
                  onClick={analyzeMedia}
                  disabled={isLoading}
                  className="w-full mt-4 gradient-accent"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Media...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mr-2" />
                      Analyze for Manipulation
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="border-primary/30">
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Analyzing Image
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Running deepfake detection and manipulation analysis...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <>
            <MediaAuthenticatorResult
              {...result}
              imagePreview={imagePreview || undefined}
            />
            
            <Button
              onClick={clearSelection}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Analyze Another Image
            </Button>
          </>
        )}

        {/* Info Section */}
        {!selectedFile && !result && (
          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <h3 className="font-display font-semibold text-foreground mb-3">
                What We Analyze
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>AI-generated image detection (deepfakes, DALL-E, Midjourney, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Photo manipulation and editing artifacts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Lighting and shadow consistency analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Compression and noise pattern anomalies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Facial feature analysis for synthetic indicators</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default MediaAuthenticator;
