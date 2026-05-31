import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BookOpen, Upload, Mic, Trash2, X, AlertCircle } from 'lucide-react';

interface StoryHelperProps {
  story: string;
  onStoryChange: (story: string) => void;
  storyFile: File | null;
  onStoryFileChange: (file: File | null) => void;
}

export default function StoryHelper({
  story,
  onStoryChange,
  storyFile,
  onStoryFileChange
}: StoryHelperProps) {
  const [activeTab, setActiveTab] = useState<'type' | 'upload' | 'voice'>('type');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'text/plain'
    ];
    
    // Check file type
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      setErrorMsg('Unsupported file type. Please upload a PDF, DOCX, DOC, or TXT file.');
      return;
    }

    // Check size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File too large. Please upload a file under 10MB.');
      return;
    }

    onStoryFileChange(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleVoiceToggle = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setErrorMsg('Voice recording is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    setErrorMsg('');
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-ZA"; // South African English
    recognitionRef.current = recognition;

    let accumulatedText = voiceText;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          accumulatedText += result[0].transcript + " ";
          setVoiceText(accumulatedText);
          onStoryChange(accumulatedText.trim());
        } else {
          interimTranscript += result[0].transcript;
        }
      }
    };

    recognition.onerror = (e: any) => {
      console.error('Speech recognition error:', e);
      setIsRecording(false);
      setErrorMsg('Recording interrupted. Please ensure your microphone is enabled.');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    setIsRecording(true);
  }, [isRecording, voiceText, onStoryChange]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="rounded-2xl border-2 border-primary/30 p-6 shadow-card space-y-4 bg-gradient-to-br from-card via-card to-primary/5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg gradient-rainbow flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Your Story</h2>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        Tell us about the memories you'd like to include. Who are they for? What's the occasion?{" "}
        <span className="font-semibold text-foreground">
          Please add as much detail as possible, including dates and any other finer detail, so that the story we create is really personalised to you and you only.
        </span>
      </p>

      {errorMsg && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="w-full">
        <div className="grid w-full grid-cols-3 bg-muted p-1 rounded-xl h-11 border border-border/10">
          {[
            { id: 'type', label: 'Type', icon: BookOpen },
            { id: 'upload', label: 'Upload', icon: Upload },
            { id: 'voice', label: 'Voice', icon: Mic }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setErrorMsg('');
                }}
                className={`flex items-center justify-center gap-1.5 text-xs md:text-sm font-semibold rounded-lg transition-all transform cursor-pointer h-full ${
                  isActive 
                    ? 'bg-background text-foreground shadow-sm scale-102 border border-border/20' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/20'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panel 1: Type */}
        {activeTab === 'type' && (
          <div className="mt-4">
            <textarea
              id="story-text"
              value={story}
              onChange={(e) => onStoryChange(e.target.value)}
              placeholder="This book is for my mom's 60th birthday. I'd love to include memories of our family holidays, Christmas dinners, and the road trip we took in 2015..."
              rows={6}
              maxLength={2000}
              className="w-full p-4 rounded-xl border border-input focus:border-primary/50 focus:ring-2 focus:ring-primary/15 bg-background text-foreground transition-all duration-250 focus:outline-none placeholder:text-muted-foreground/45 text-sm font-sans"
            />
            <p className="text-xs text-muted-foreground mt-2 text-right">
              {story.length} / 2000 characters
            </p>
          </div>
        )}

        {/* Tab Panel 2: Upload */}
        {activeTab === 'upload' && (
          <div className="mt-4 space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {storyFile ? (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/40 animate-fade-in-up">
                <BookOpen className="w-8 h-8 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-foreground">{storyFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(storyFile.size / 1024).toFixed(0)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => onStoryFileChange(null)}
                  className="p-1 rounded-full text-muted-foreground hover:bg-muted duration-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[120px] flex flex-col items-center justify-center border-dashed border-2 border-border/80 hover:border-primary/50 rounded-2xl bg-muted/20 text-muted-foreground hover:text-foreground transition-all duration-300 cursor-pointer"
              >
                <Upload className="w-8 h-8 mb-2 text-muted-foreground/60" />
                <span className="text-sm font-semibold">Upload PDF, DOCX, DOC, or TXT</span>
                <span className="text-xs text-muted-foreground/60 mt-1">Maximum size: 10MB</span>
              </button>
            )}
          </div>
        )}

        {/* Tab Panel 3: Voice */}
        {activeTab === 'voice' && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/80 bg-muted/10 rounded-2xl">
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-transform cursor-pointer transform active:scale-95 ${
                  isRecording 
                    ? 'bg-destructive text-destructive-foreground animate-pulse rotate-3' 
                    : 'gradient-primary text-primary-foreground shadow-soft hover:scale-110'
                }`}
              >
                <Mic className="w-6 h-6" />
              </button>
              
              <p className="text-sm font-semibold text-foreground mt-4">
                {isRecording ? "Recording… Click to stop" : "Tap the microphone to start speaking your story"}
              </p>
            </div>

            {story && (
              <div className="p-4 rounded-xl border border-border bg-muted/30 animate-fade-in-up space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Spoken Transcript</span>
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceText('');
                      onStoryChange('');
                    }}
                    className="p-1 rounded bg-muted hover:bg-border/60 text-muted-foreground flex items-center gap-1 text-xs font-sans cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap font-sans">
                  {story}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
