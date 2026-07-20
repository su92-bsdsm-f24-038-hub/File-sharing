"use client";

import React, { useRef, useState, useEffect } from "react";
import { X, Save, Pencil, MousePointer2, Type, Square, ArrowRight, Undo } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ImageAnnotationEditorProps {
  file: File;
  onSave: (file: File) => void;
  onCancel: () => void;
}

type ToolType = "draw" | "arrow" | "rect" | "text";

interface DrawAction {
  tool: ToolType;
  color: string;
  size: number;
  path: { x: number; y: number }[];
  text?: string;
}

const COLORS = ["#FF7A1A", "#FFFFFF", "#FF0000", "#000000"];

export function ImageAnnotationEditor({ file, onSave, onCancel }: ImageAnnotationEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>("draw");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(4);
  const [history, setHistory] = useState<DrawAction[]>([]);
  const [currentAction, setCurrentAction] = useState<DrawAction | null>(null);
  
  // Load image
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImage(img);
    };
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Render canvas
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw base image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw history
    const allActions = currentAction ? [...history, currentAction] : history;
    allActions.forEach((action) => {
      ctx.beginPath();
      ctx.strokeStyle = action.color;
      ctx.fillStyle = action.color;
      ctx.lineWidth = action.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (action.tool === "draw" && action.path.length > 0) {
        ctx.moveTo(action.path[0].x, action.path[0].y);
        for (let i = 1; i < action.path.length; i++) {
          ctx.lineTo(action.path[i].x, action.path[i].y);
        }
        ctx.stroke();
      } else if (action.tool === "rect" && action.path.length === 2) {
        const [start, end] = action.path;
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      } else if (action.tool === "arrow" && action.path.length === 2) {
        const [start, end] = action.path;
        const headlen = 15;
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - headlen * Math.cos(angle - Math.PI / 6), end.y - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(end.x - headlen * Math.cos(angle + Math.PI / 6), end.y - headlen * Math.sin(angle + Math.PI / 6));
        ctx.lineTo(end.x, end.y);
        ctx.lineTo(end.x - headlen * Math.cos(angle - Math.PI / 6), end.y - headlen * Math.sin(angle - Math.PI / 6));
        ctx.stroke();
        ctx.fill();
      } else if (action.tool === "text" && action.path.length > 0 && action.text) {
        ctx.font = `${action.size * 4}px Inter, sans-serif`;
        ctx.fillText(action.text, action.path[0].x, action.path[0].y);
      }
    });
  };

  useEffect(() => {
    if (image && canvasRef.current) {
      // Set canvas size to match image aspect ratio within container
      const container = containerRef.current;
      if (container) {
        const containerRatio = container.clientWidth / container.clientHeight;
        const imageRatio = image.width / image.height;
        
        let width, height;
        if (imageRatio > containerRatio) {
          width = container.clientWidth;
          height = width / imageRatio;
        } else {
          height = container.clientHeight;
          width = height * imageRatio;
        }
        
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        renderCanvas();
      }
    }
  }, [image, containerRef.current?.clientWidth, containerRef.current?.clientHeight]);

  useEffect(() => {
    renderCanvas();
  }, [history, currentAction, image]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    if (activeTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        setHistory([...history, { tool: "text", color, size, path: [pos], text }]);
      }
      return;
    }
    setCurrentAction({ tool: activeTool, color, size, path: [pos] });
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!currentAction || activeTool === "text") return;
    const pos = getPos(e);
    if (activeTool === "draw") {
      setCurrentAction({ ...currentAction, path: [...currentAction.path, pos] });
    } else {
      setCurrentAction({ ...currentAction, path: [currentAction.path[0], pos] });
    }
  };

  const handlePointerUp = () => {
    if (currentAction) {
      setHistory([...history, currentAction]);
      setCurrentAction(null);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const newFile = new File([blob], file.name, { type: "image/png" });
      onSave(newFile);
    }, "image/png", 0.95);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col">
      {/* Top Bar */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-indigo-black/50">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="text-neutral-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <span className="font-semibold">Annotate Image</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setHistory(history.slice(0, -1))} disabled={history.length === 0} icon={<Undo className="w-4 h-4" />}>Undo</Button>
          <Button variant="primary" size="sm" onClick={handleSave} icon={<Save className="w-4 h-4" />}>Save & Send</Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Tools */}
        <div className="w-20 border-r border-white/10 bg-indigo-black/30 flex flex-col items-center py-6 gap-6">
          <div className="flex flex-col gap-3">
            <ToolBtn active={activeTool === "draw"} onClick={() => setActiveTool("draw")} icon={<Pencil className="w-5 h-5" />} />
            <ToolBtn active={activeTool === "arrow"} onClick={() => setActiveTool("arrow")} icon={<ArrowRight className="w-5 h-5" />} />
            <ToolBtn active={activeTool === "rect"} onClick={() => setActiveTool("rect")} icon={<Square className="w-5 h-5" />} />
            <ToolBtn active={activeTool === "text"} onClick={() => setActiveTool("text")} icon={<Type className="w-5 h-5" />} />
          </div>

          <div className="w-10 h-px bg-white/10" />

          <div className="flex flex-col gap-3">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? "scale-110 border-white" : "border-transparent scale-100 hover:scale-110"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="w-10 h-px bg-white/10" />

          <div className="flex flex-col gap-2 w-full px-4">
            <span className="text-[10px] text-neutral-500 text-center uppercase tracking-wider">Size</span>
            <input 
              type="range" min="2" max="20" value={size} onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-primary-orange"
            />
          </div>
        </div>

        {/* Canvas Area */}
        <div ref={containerRef} className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
          {!image && <div className="text-white/50 animate-pulse">Loading image...</div>}
          <canvas
            ref={canvasRef}
            className="touch-none rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black/20"
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          />
        </div>
      </div>
    </div>
  );
}

function ToolBtn({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${active ? "bg-primary-orange text-white shadow-lg shadow-primary-orange/30" : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"}`}
    >
      {icon}
    </button>
  );
}
